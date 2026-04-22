const fs = require('fs');

const path = require('path');

function replaceInFile(filePath, regex, replacement) {
    if(!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(regex, replacement);
    if(newContent !== content) {
        fs.writeFileSync(filePath, newContent);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            // mass replace (session.user as any)?.id to session.user?.id
            replaceInFile(fullPath, /\(session\.user as any\)\?\.id/g, 'session.user?.id');
            // mass replace } as any); to });
            // wait, some are .insertOne(doc as any), we should not auto-remove all as any unless sure.
        }
    }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Done auto-formatting session.user casts.');
