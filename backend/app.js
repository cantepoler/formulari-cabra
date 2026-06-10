import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream, createWriteStream } from 'node:fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8081;

const AFORAMENTS_INICIALS = {
    estat_formulari: "START",
    tasques_logistiques: [
        { id: 't1', hora: '12:00', nom: 'Muntatge Coromines', places_lliures: 5 },
        { id: 't2', hora: '12:00', nom: 'Muntatge Plaça', places_lliures: 4 },
        { id: 't3', hora: '17:00', nom: 'Muntatge Parc', places_lliures: 6 },
        { id: 't4', hora: '18:00', nom: 'Suport Teatre', places_lliures: 2 },
        { id: 't5', hora: '21:00', nom: 'Suport Coromines', places_lliures: 3 },
        { id: 't6', hora: '00:00', nom: 'Torn 1 Barra', places_lliures: 0 }
    ]
};

// Middlewares bàsics
app.use(express.json());
// Servim la carpeta public (on anirà el Vue compilat per a l'entrega)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoints de l'API
app.get('/api/initial_info', (req, res) => {
    let data = ""
    createReadStream("save_file.txt", "utf-8")
        .on("data", chunk => {
            data += chunk
        })
        .on("end", () => {
            console.log(data);
            
            res.json(JSON.parse(data))
        })
        .on("error", () => {
            res.status(200).json(AFORAMENTS_INICIALS)
        })
});

app.post('/api/save', (req, res) => {
    console.log("Dades rebudes per guardar:", req.body);
    res.status(200).json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Backend escoltant al port ${PORT}`);
});