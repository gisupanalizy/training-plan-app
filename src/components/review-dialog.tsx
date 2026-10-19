"use client";
import { Icon } from '@/components/ui';
import styles from './plan-authoring.module.css';
import { useEffect, useRef, type ReactNode } from 'react';
export function ReviewDialog({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);const heading=useRef<HTMLHeadingElement>(null);const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  const dialog=ref.current!,previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
  if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');
  document.body.style.overflow='hidden';heading.current?.focus();
  return()=>{if(dialog.open&&dialog.close)dialog.close();document.body.style.overflow=overflow;if(previous?.isConnected&&!previous.matches(':disabled'))previous.focus();else document.querySelector<HTMLElement>('[data-review-heading]')?.focus();};
 },[]);
 return <dialog ref={ref} className={`review-dialog ${styles.dialog}`} aria-modal="true" aria-labelledby="review-dialog-title" onKeyDown={event=>{
  if(event.key!=='Tab')return;
  const elements=[...ref.current!.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled):not([type=hidden]),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')].filter(element=>element.getClientRects().length>0);
  const first=elements[0],last=elements.at(-1),active=document.activeElement;
  if(!first){event.preventDefault();heading.current?.focus();return;}
  if(event.shiftKey&&(active===first||active===heading.current||!ref.current!.contains(active))){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&(active===last||!ref.current!.contains(active))){event.preventDefault();first.focus();}
 }} onCancel={event=>{event.preventDefault();close.current();}}>
  <header className="review-dialog-header"><h2 ref={heading} id="review-dialog-title" tabIndex={-1}>{title}</h2><button type="button" aria-label="Zamknij okno" onClick={onClose}><Icon name="close" /></button></header>
  <div className="review-dialog-content">{children}</div>
 </dialog>;
}
