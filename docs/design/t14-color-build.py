"""Osobna galeria palet, z zachowaniem surowych ramek do porównań."""
exec(compile((base.parent/'t14-themes.py').read_text(),str(base.parent/'t14-themes.py'),'exec'),globals())

def build_color_gallery():
 colorout=out.with_name('t14-colors.html')
 if data.get('private') and colorout.is_relative_to(root):raise ValueError('Prywatna galeria kolorów musi zostać poza repo')
 color_payload={'confirmed':CONFIRMED,'private':data.get('private',False),'meta':meta,'sessions':payload['sessions'],'back':out.name}
 template=(base.parent/'t14-color-template.html').read_text()
 for marker,obj in [('__PALETTES__',PALETTES),('__ROLE_MAP__',COLOR_ROLES),('__FRAMES__',frames),('__DATA__',color_payload),('__THEME_CSS__',THEME_CSS)]:
  template=template.replace(marker,json.dumps(obj,ensure_ascii=False).replace('</script>','<\\/script>'))
 colorout.write_text(template)
 print(json.dumps({'colorOutput':str(colorout),'palettes':len(PALETTES),'private':data.get('private',False),'bytes':colorout.stat().st_size}))

build_color_gallery()
