import zipfile, os

dest_base = '_clearance_temp'
os.makedirs(dest_base, exist_ok=True)

z = zipfile.ZipFile('Clearances -20260605T141227Z-3-001.zip')
for item in z.infolist():
    parts = item.filename.replace('\\', '/').split('/')
    parts = [p.strip() for p in parts]
    clean = '/'.join(p for p in parts if p)

    if not clean:
        continue

    dest = os.path.join(dest_base, *clean.split('/'))

    if item.filename.endswith('/'):
        os.makedirs(dest, exist_ok=True)
    else:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        try:
            with z.open(item) as src:
                data = src.read()
            with open(dest, 'wb') as f:
                f.write(data)
        except Exception as e:
            print(f'SKIP {clean}: {e}')

print('Done')
