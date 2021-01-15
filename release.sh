NAME="chissl-widget"
DATE=`date +%m.%d.%y`

zip -rv "$NAME.$DATE.zip" widget -x widget/js/node_modules/\*

