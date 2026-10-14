import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
const { chromium } = await import(pathToFileURL((process.env.T07R1_PLAYWRIGHT_MODULE??process.env.T06R1_PLAYWRIGHT_MODULE)).href);
const base = process.env.T06R1_HTTP_BASE ?? 'http://localhost:3006';
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const report = JSON.parse(readFileSync('fixtures/t06/real/results/after-4.json','utf8'));
const users = [], paths = [];
const ok = (r) => { if(r.error) throw new Error(r.error.message); return r.data; };
const browser = await chromium.launch({headless:true, channel:'chrome'});
try {
  for (const [index, row] of report.rows.entries()) {
    const email=`t07r1-ui-${randomUUID()}@example.invalid`, password=randomUUID();
    const {user}=ok(await admin.auth.admin.createUser({email,password,email_confirm:true}));users.push(user.id);
    ok(await admin.from('profiles').insert({id:user.id}));
    const source=row.result.job, id=randomUUID();
    const bytes=readFileSync(`fixtures/t06/real/${row.name}`);
    const job=ok(await admin.rpc('create_import_job',{p_owner:user.id,p_id:id,p_kind:source.source_kind,p_mime:source.mime_type,p_size:bytes.length,p_text:null}));
    paths.push(job.source_path);
    ok(await admin.storage.from('training-imports').upload(job.source_path,bytes,{contentType:source.mime_type}));
    ok(await admin.from('imports').update({status:'needs_review',draft:source.draft,validation_issues:source.validation_issues}).eq('id',id));
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    const jar=new Map();
    const client=createServerClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,{cookies:{getAll:()=>[...jar].map(([name,value])=>({name,value})),setAll:(items)=>items.forEach(({name,value})=>jar.set(name,value))}});
    ok(await client.auth.signInWithPassword({email,password}));
    await context.addCookies([...jar].map(([name,value])=>({name,value:encodeURIComponent(value),url:base})));
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/plany/import?id=${id}`);
    await page.getByRole('heading',{name:'Ćwiczenia',exact:true}).waitFor();
    assert.equal(await page.locator('.review-exercise-card').count(),row.document.sessions[0].exercises.length);
    assert.equal(await page.locator('.review-source-panel').count(),0);
    assert.equal(await page.locator('.review-main input[type="number"]').count(),0,'żadne serie nie otwierają formularzy');
    if(index===0){
      await page.getByRole('button',{name:'Pokaż źródło',exact:true}).click();
      const pages=page.getByLabel('Strona PDF');await pages.locator('option').nth(5).waitFor({state:'attached'});
      for(let n=1;n<=6;n++){await pages.selectOption(String(n));await page.getByLabel(`Oryginalny PDF — strona ${n}`).waitFor();await page.waitForFunction(()=>!document.querySelector('.pdf-page-scroll [role="status"]')&&document.querySelector('.pdf-page-scroll canvas')?.width>0);}
      await page.getByLabel('Powiększ PDF').click();await page.getByRole('button',{name:'Pełny ekran',exact:true}).click();await page.getByRole('dialog',{name:'Podgląd oryginalnego PDF'}).waitFor();await page.keyboard.press('Escape');
      await page.getByRole('button',{name:'Wróć do planu',exact:true}).click();
      await page.getByRole('button',{name:'Potwierdź ćwiczenia',exact:true}).click();await page.getByRole('heading',{name:'Serie i superserie',exact:true}).waitFor();
      const first=page.locator('.review-exercise-card').first();assert.match(await first.innerText(),/7–8 serii × 1 powtórzenie/);assert.match(await first.innerText(),/Ósma seria opcjonalna/);
      await page.locator('.import-review').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+window.scrollY));await page.screenshot({path:'/private/tmp/t07r1-cards-desktop.png'});
      const originalIds=row.document.sessions[0].exercises[0].sets.map(s=>s.reviewId);
      await first.getByRole('button',{name:'Edytuj blok',exact:true}).click();let dialog=page.getByRole('dialog',{name:'Edytuj blok serii'});
      await dialog.getByLabel('Powtórzenia od',{exact:true}).fill('2');await page.keyboard.press('Escape');assert.match(await first.innerText(),/7–8 serii × 1 powtórzenie/);
      await first.getByRole('button',{name:'Edytuj blok',exact:true}).click();dialog=page.getByRole('dialog',{name:'Edytuj blok serii'});await dialog.getByLabel('Powtórzenia od',{exact:true}).fill('2');await dialog.getByRole('button',{name:'Zastosuj zmiany',exact:true}).click();
      await page.getByRole('button',{name:'Zapisz korektę',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.review-save-status')?.textContent==='Korekta zapisana');await page.reload();await page.getByRole('heading',{name:'Serie i superserie',exact:true}).waitFor();assert.match(await page.locator('.review-exercise-card').first().innerText(),/7–8 serii × 2 powtórzenia/);
      let saved=ok(await admin.from('imports').select('review_data').eq('id',id).single()).review_data;
      assert.deepEqual(saved.document.sessions[0].exercises[0].sets.map(s=>s.reviewId),originalIds);assert.equal(saved.document.sessions[0].exercises[0].sets.filter(s=>s.isOptional).length,1);
      await page.getByRole('button',{name:'Wyjaśnij niejasności (1)',exact:true}).click();dialog=page.getByRole('dialog',{name:'Wyjaśnij niejasność'});
      assert.ok(await dialog.getByRole('button',{name:'Potwierdź interpretację'}).isDisabled(),'nie można potwierdzić bez korekty przerwy');
      await dialog.getByRole('button',{name:'Pokaż źródło',exact:true}).click();await dialog.getByLabel('Strona PDF').locator('option').nth(5).waitFor({state:'attached'});assert.equal(await dialog.getByLabel('Strona PDF').inputValue(),'4');assert.equal(await dialog.getByRole('button',{name:'Pełny ekran',exact:true}).count(),0,'bez zagnieżdżonego modala');
      await dialog.getByRole('button',{name:'← Wróć do pytania',exact:true}).click();await dialog.getByRole('button',{name:'Popraw parametry',exact:true}).click();await dialog.getByLabel('Przerwa od (s)',{exact:true}).fill('60');await dialog.getByLabel('Przerwa do (s)',{exact:true}).fill('120');await dialog.getByRole('button',{name:'Zastosuj zmiany',exact:true}).click();
      await dialog.getByRole('button',{name:'Potwierdź interpretację',exact:true}).click();await page.getByRole('button',{name:'Wróć do planu',exact:true}).click();
      await page.getByRole('button',{name:'Potwierdź serie i superserie',exact:true}).click();await page.getByRole('heading',{name:'Podsumowanie',exact:true}).waitFor();assert.ok(await page.getByRole('button',{name:'Zatwierdź i utwórz plan',exact:true}).isEnabled());
      await page.reload();await page.getByRole('heading',{name:'Podsumowanie',exact:true}).waitFor();assert.ok(await page.getByRole('button',{name:'Zatwierdź i utwórz plan',exact:true}).isEnabled(),'potwierdzenia przetrwały JSONB i reload');
      await page.getByRole('button',{name:'1 Ćwiczenia',exact:false}).click();await page.getByRole('heading',{name:'Ćwiczenia',exact:true}).waitFor();await page.locator('.review-exercise-card').first().getByRole('button',{name:'Edytuj ćwiczenie',exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('Wariant',{exact:true}).fill('Wariant testowy');await dialog.getByRole('button',{name:'Zastosuj zmiany',exact:true}).click();await page.getByRole('button',{name:'Zapisz korektę',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('.review-save-status')?.textContent==='Korekta zapisana');saved=ok(await admin.from('imports').select('review_data').eq('id',id).single()).review_data;assert.equal(saved.progress.exercisesConfirmed,null);assert.equal(saved.progress.structureConfirmed,null);
      await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Pokaż źródło',exact:true}).click();await page.getByRole('dialog',{name:'Oryginalne źródło',exact:true}).waitFor();await page.getByLabel('Strona PDF').locator('option').nth(5).waitFor({state:'attached'});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'brak mobilnego overflow');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Potwierdź ćwiczenia',exact:true}).click();await page.getByRole('heading',{name:'Serie i superserie',exact:true}).waitFor();await page.locator('.import-review').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+window.scrollY));await page.screenshot({path:'/private/tmp/t07r1-cards-mobile.png'});
      await page.locator('.review-exercise-card').first().getByRole('button',{name:'Edytuj blok',exact:true}).click();dialog=page.getByRole('dialog');
      await dialog.waitFor({state:'visible'});await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.ok(await page.evaluate(()=>document.querySelector('dialog[open]')?.contains(document.activeElement)),'fokus wewnątrz dialogu');
      await page.screenshot({path:'/private/tmp/t07r1-edit-mobile.png'});await page.keyboard.press('Escape');
    }else{
      await page.getByRole('button',{name:'Pokaż źródło',exact:true}).click();const sheets=page.getByLabel('Arkusz źródłowy');await sheets.waitFor();
      if(index===1){for(const name of ['Trening A','Trening B','Trening C'])await sheets.selectOption({label:name});assert.match(await page.locator('[data-address="B8"]').innerText(),/2025|DATA/);}
      else{await sheets.selectOption({label:'TRENINGI'});await page.locator('[data-address="A54"]').scrollIntoViewIfNeeded();assert.ok(await page.locator('[data-address="A54"]').isVisible());assert.match(await page.locator('[data-address="A11"]').getAttribute('class'),/source-strike/);for(const name of ['Wymiary','Uwagi','Sheet1'])await sheets.selectOption({label:name});}
      await page.getByRole('button',{name:'Wróć do planu',exact:true}).click();
      if(index===1){
        await page.getByRole('button',{name:'Wyjaśnij niejasności (2)',exact:true}).click();let dialog=page.getByRole('dialog');await dialog.screenshot({path:'/private/tmp/t07r1-survey-desktop.png'});await dialog.getByRole('radio',{name:/Maszyna/}).check();await dialog.getByRole('button',{name:'Zastosuj odpowiedź'}).click();await dialog.getByRole('radio',{name:/Sztanga/}).check();await dialog.getByRole('button',{name:'Zastosuj odpowiedź'}).click();await page.getByRole('button',{name:'Wróć do planu',exact:true}).click();
        const first=page.locator('.review-exercise-card').first(),name=await first.getByRole('heading').innerText();await first.getByRole('button',{name:`Przesuń w dół: ${name}`,exact:true}).click();
        await page.getByRole('button',{name:'Potwierdź ćwiczenia'}).click();await page.getByRole('heading',{name:'Serie i superserie',exact:true}).waitFor();
        await page.getByRole('button',{name:'Wyjaśnij niejasności (4)',exact:true}).click();dialog=page.getByRole('dialog');
        for(let n=0;n<3;n++){await dialog.getByRole('radio',{name:'Na jedną rękę',exact:true}).check();await dialog.getByRole('button',{name:'Zastosuj odpowiedź'}).click();}
        await dialog.getByLabel('Wartość / od',{exact:true}).fill('2');await dialog.getByLabel('Do (opcjonalnie)',{exact:true}).fill('3');await dialog.getByRole('button',{name:'Zastosuj odpowiedź'}).click();await dialog.getByRole('radio',{name:'Maksymalna liczba powtórzeń',exact:true}).check();await dialog.getByRole('button',{name:'Zastosuj odpowiedź'}).click();await page.getByRole('button',{name:'Wróć do planu',exact:true}).click();
        await page.getByRole('button',{name:'Zapisz korektę'}).click();await page.waitForFunction(()=>document.querySelector('.review-save-status')?.textContent==='Korekta zapisana');await page.reload();await page.getByRole('heading',{name:'Serie i superserie',exact:true}).waitFor();assert.equal(await page.locator('.review-exercise-card').nth(1).getByRole('heading').innerText(),name);
        const saved=ok(await admin.from('imports').select('review_data').eq('id',id).single()).review_data.document;const date=saved.sessions[2].exercises.find(e=>e.sourceRef?.includes('B8'));assert.equal(date.setCountMin,2);assert.equal(date.setCountMax,3);assert.ok(date.sets.every(s=>s.isAmrap));
      }else{
        await page.getByRole('button',{name:'Potwierdź ćwiczenia'}).click();await page.getByRole('heading',{name:'Serie i superserie',exact:true}).waitFor();await page.getByRole('button',{name:'Wyjaśnij niejasności (17)',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Później'}).click();for(let skip=0;skip<17&&!await dialog.getByRole('button',{name:'Potwierdź interpretację',exact:true}).count();skip++)await dialog.getByRole('button',{name:'Później'}).click();await dialog.getByRole('button',{name:'Potwierdź interpretację',exact:true}).click();await dialog.getByRole('button',{name:'Zamknij okno'}).click();assert.ok(await page.getByRole('button',{name:'Wyjaśnij niejasności (16)',exact:true}).isVisible());
      }
    }
    assert.deepEqual(errors,[],'brak błędów przeglądarki');await context.close();
  }
  console.log('T07-R1 browser: PASS — trzy kroki, krótkie karty, blok/cancel, ankiety, stabilne odpowiedzi, krok/reload, focus/mobile, 6 stron PDF i wszystkie arkusze. Zachowane rzeczywiste wyniki, bez nowego AI.');
}finally{await browser.close();if(paths.length)ok(await admin.storage.from('training-imports').remove(paths));for(const id of users)ok(await admin.auth.admin.deleteUser(id));}
