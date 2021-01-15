npm install
npm run build-css
npm run build -- --copy-files --no-demo
cd widget/js
npm install
npm run prepublish
cd ..
pip install -e .
cd ..
jupyter nbextension install --py --symlink --sys-prefix chissl
jupyter nbextension enable --py --sys-prefix chissl
