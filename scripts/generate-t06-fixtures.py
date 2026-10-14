"""Generuje wyłącznie syntetyczne źródła T06 w katalogu podanym argumentem."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

cases = json.loads((Path(__file__).parent.parent / 'fixtures/t06/cases.json').read_text())
out = Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)

def simple_pdf(text, path):
    safe = text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)').encode('ascii')
    stream = b'BT /F1 12 Tf 40 750 Td (' + safe + b') Tj ET'
    objs = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
            b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            b'<< /Length ' + str(len(stream)).encode() + b' >>\nstream\n' + stream + b'\nendstream']
    data = b'%PDF-1.4\n'
    offsets = [0]
    for number, obj in enumerate(objs, 1):
        offsets.append(len(data))
        data += f'{number} 0 obj\n'.encode() + obj + b'\nendobj\n'
    start = len(data)
    data += b'xref\n0 6\n0000000000 65535 f \n'
    data += b''.join(f'{offset:010d} 00000 n \n'.encode() for offset in offsets[1:])
    data += b'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + str(start).encode() + b'\n%%EOF\n'
    path.write_bytes(data)

for case in cases:
    name = case['id']
    fmt = case['format']
    source = case['source']
    if fmt == 'text':
        (out / (name + '.txt')).write_text(source, encoding='utf-8')
    elif fmt == 'pdf_text':
        simple_pdf(source, out / (name + '.pdf'))
    else:
        image = Image.new('RGB', (1300, 400), 'white')
        draw = ImageDraw.Draw(image)
        try:
            font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 42)
        except OSError:
            font = ImageFont.truetype('DejaVuSans.ttf', 42)
        lines = []
        current = ''
        for word in source.split():
            candidate = f'{current} {word}'.strip()
            if current and draw.textbbox((0, 0), candidate, font=font)[2] > 1200:
                lines.append(current)
                current = word
            else:
                current = candidate
        if current: lines.append(current)
        for index, line in enumerate(lines):
            draw.text((35, 55 + 68 * index), line, font=font, fill='black')
        if name == 'jpeg-blur': image = image.filter(ImageFilter.GaussianBlur(2.5))
        if fmt == 'pdf_scan': image.save(out / (name + '.pdf'), 'PDF', resolution=150)
        elif fmt == 'png': image.save(out / (name + '.png'), 'PNG')
        else: image.save(out / (name + '.jpg'), 'JPEG', quality=88)
print(f'Wygenerowano {len(cases)} syntetycznych źródeł w {out}')
