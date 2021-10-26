const {articles} = require('./src/articles');
const { exec } = require('child_process');

exports.createPages = async (
  {actions, graphql},
) => {
  for (let title in articles) {
    let root = articles[title].root;
    let o_title = !!articles[title].original_title ? articles[title].original_title : "";
    let o = !!articles[title].origin ? articles[title].origin : "";
    let command = `cd pandoc && bash run_pandoc.sh "${title}" ../content/${root} "../public/${root}.pdf" "${o_title}" "${o}"`;
    exec(command,(err, stdout, stderr) => {
      if (err) {
        console.log(`Cannot execute ${command}: ${err}`);
        return;
      }

      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  }
};
