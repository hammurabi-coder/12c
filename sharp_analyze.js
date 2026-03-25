
const sharp = require('sharp');

async function analyze() {
  const files = ['JULIUS', 'VITELLIUS', 'NERO'];
  for (const name of files) {
    const meta = await sharp(`static/content/busts/${name}.png`)
      .metadata();
    console.log(`${name}: width=${meta.width} height=${meta.height} channels=${meta.channels} space=${meta.space}`);
    
    // Get corner pixels
    const corners = await sharp(`static/content/busts/${name}.png`)
      .extract({ left: 0, top: 0, width: 10, height: 10 })
      .raw()
      .toBuffer();
    console.log(`  Top-left 10x10 avg alpha: ${Array.from(corners).filter((v,i) => i%4===3).reduce((a,b)=>a+b,0)/10}`);
    
    // Get center 100x100
    const center = await sharp(`static/content/busts/${name}.png`)
      .extract({ left: 462, top: 462, width: 100, height: 100 })
      .raw()
      .toBuffer();
    const alphas = Array.from(center).filter((v,i) => i%4===3);
    const avgAlpha = alphas.reduce((a,b)=>a+b,0)/alphas.length;
    const nonZero = alphas.filter(a=>a>10).length;
    console.log(`  Center 100x100: avg alpha=${avgAlpha.toFixed(1)}, non-transparent=${nonZero}/${alphas.length}`);
  }
}
analyze().catch(console.error);
