const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Kết nối MySQL trong Docker
const db = mysql.createConnection({
    host: 'db',
    user: 'root',
    password: 'secret',
    database: 'calc_db'
});

db.connect(err => {
    if (err) console.error('❌ Lỗi kết nối DB: ' + err.stack);
    else console.log('✅ Đã kết nối MySQL thành công!');
});

// API Lấy thông tin cho trang About riêng biệt
app.get('/api/about', (req, res) => {
    res.json({
        hoTen: "Trần Thế Kiệt",
        mssv: "2251220014",
        lop: "22CT1",
        app: "DevOps Windows Calculator"
    });
});

// API Tính toán và lưu DB
app.post('/api/calculate', (req, res) => {
    const { type, expression, a, b, c } = req.body;
    let finalExpr = "";
    let finalRes = "";

    try {
        if (type === 'basic_raw') {
            finalExpr = expression;
            finalRes = eval(expression).toString();
        } else if (type === 'quadratic') {
            const fa = parseFloat(a), fb = parseFloat(b), fc = parseFloat(c);
            finalExpr = `${fa}x² + ${fb}x + ${fc} = 0`;
            const delta = fb * fb - 4 * fa * fc;
            if (delta < 0) finalRes = "Vô nghiệm";
            else if (delta === 0) finalRes = `x = ${(-fb / (2 * fa)).toFixed(2)}`;
            else {
                const x1 = (-fb + Math.sqrt(delta)) / (2 * fa);
                const x2 = (-fb - Math.sqrt(delta)) / (2 * fa);
                finalRes = `x1 = ${x1.toFixed(2)}, x2 = ${x2.toFixed(2)}`;
            }
        }

        db.query("INSERT INTO history (expression, result) VALUES (?, ?)", [finalExpr, finalRes], () => {
            res.json({ expression: finalExpr, result: finalRes });
        });
    } catch (e) { res.status(400).json({ error: "Lỗi" }); }
});

app.get('/api/history', (req, res) => {
    db.query("SELECT * FROM history ORDER BY id DESC LIMIT 10", (err, results) => {
        res.json(results);
    });
});

app.listen(5000, () => console.log('🚀 Backend chạy tại port 5000'));