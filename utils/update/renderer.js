let updateContent = document.getElementById('update-content')
let content = `<div>检查更新中<div/>`
let count = 0
let interval = setInterval(() => {
    updateContent.innerHTML = content
    for (let i = 0; i < count; i++) {
        updateContent.innerText += "."
    }
    count = count > 4 ? 1 : count + 1
}, 800)

window.electronAPI.onUpdateContent((_event, value) => {
    if (value == 1) {
        content += `<div>正在下载更新包<div/>`
    } else if (value == 2) {
        content += `<div>正在解压更新包<div/>`
    } else {
        content += `<div>更新完成，加载文件中<div/>`
    }
    count = 0
})