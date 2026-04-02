require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

app.get('/health', (req, res) => res.json({ status: "ok" }));

app.get('/about', (req, res) => {
    res.json({
        name: "Trần Thế Kiệt", 
        student_id: "2251220014",
        class: "22CT1"
    });
});

app.get('/api/history', (req, res) => {
    db.query('SELECT * FROM history ORDER BY id DESC LIMIT 10', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/calculate', (req, res) => {
    const { num1, num2, operator } = req.body;
    let result = 0;
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (operator === '+') result = n1 + n2;
    else if (operator === '-') result = n1 - n2;
    else if (operator === '*') result = n1 * n2;
    else if (operator === '/') result = n2 !== 0 ? (n1 / n2).toFixed(2) : "Lỗi chia cho 0";

    const expression = `${n1} ${operator} ${n2}`;
    db.query('INSERT INTO history (expression, result) VALUES (?, ?)', [expression, result.toString()], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ expression, result });
    });
});

app.post('/api/quadratic', (req, res) => {
    const { a, b, c } = req.body;
    const A = parseFloat(a);
    const B = parseFloat(b);
    const C = parseFloat(c);

    if (A === 0) return res.json({ result: "a phải khác 0" });

    const delta = B * B - 4 * A * C;
    let resultText = "";

    if (delta < 0) resultText = "Vô nghiệm";
    else if (delta === 0) resultText = `Nghiệm kép x = ${(-B / (2 * A)).toFixed(2)}`;
    else {
        const x1 = ((-B + Math.sqrt(delta)) / (2 * A)).toFixed(2);
        const x2 = ((-B - Math.sqrt(delta)) / (2 * A)).toFixed(2);
        resultText = `x1 = ${x1}, x2 = ${x2}`;
    }

    const expression = `${A}x² + ${B}x + ${C} = 0`;
    db.query('INSERT INTO history (expression, result) VALUES (?, ?)', [expression, resultText], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ expression, result: resultText });
    });
});

app.listen(process.env.PORT, () => console.log(`Backend is running...`));