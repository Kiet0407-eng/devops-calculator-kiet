function showPage(pageId) {
    if (pageId === 'about') {
        document.getElementById('calculator-container').style.display = 'none';
        document.getElementById('about-page').style.display = 'block';
        
        // Gọi API để lấy thông tin
        fetch('http://localhost:5000/api/about')
            .then(res => res.json())
            .then(data => {
                document.getElementById('name').innerText = data.hoTen;
                document.getElementById('id').innerText = data.mssv;
                document.getElementById('class').innerText = data.lop;
                document.getElementById('app-name').innerText = data.app;
            });
    } else {
        document.getElementById('calculator-container').style.display = 'block';
        document.getElementById('about-page').style.display = 'none';
    }
}