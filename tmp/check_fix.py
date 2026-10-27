with open('src/render/ladaRenderer.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's check each target string
targets = [
    'panicked',
    'drawKlekanice',
    'drawCert',
    'drawHejkal',
    'drawUmrlec',
    'drawPisar',
    'drawHrobnik',
    'drawDivozenka',
    'drawMeluzina',
    'drawSkodnik',
    'drawMysak',
    'drawBlatouch'
]
for t in targets:
    print(t, t in content)
