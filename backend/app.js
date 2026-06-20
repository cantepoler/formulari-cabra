import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// Atenció als imports! writeFile va aquí baix, amb readFile
import { createReadStream, existsSync, writeFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8081;

const AFORAMENTS_INICIALS = {
    estat_formulari: "START",
    tasques_logistiques: {
        dia10: [
            { id: 'd10_t1', hora: '12:00', nom: 'Muntatge Coromines', places_lliures: 5 },
            { id: 'd10_t2', hora: '12:00', nom: 'Muntatge Plaça', places_lliures: 4 },
            { id: 'd10_t3', hora: '17:00', nom: 'Muntatge Parc', places_lliures: 6 }
        ],
        dia11: [
            { id: 'd11_t1', hora: '12:00', nom: 'Muntatge Coromines', places_lliures: 5 },
            { id: 'd11_t2', hora: '12:00', nom: 'Muntatge Plaça', places_lliures: 4 },
            { id: 'd11_t3', hora: '17:00', nom: 'Muntatge Parc', places_lliures: 6 }
        ]
    },
};

if (!existsSync("save_file.txt")) {
    writeFileSync("save_file.txt", JSON.stringify(AFORAMENTS_INICIALS, null, 2))
}

// Middlewares bàsics
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoints de l'API
app.get('/api/initial_info', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const fluxLectura = createReadStream("save_file.txt")
    fluxLectura.pipe(res)
});

app.post('/api/save', (req, res) => {
    console.log("Dades rebudes per guardar:", req.body.dadesPersonals.nom);
    const inscripcio = req.body
    const tasques_demanades = inscripcio.tasquesTriades || []

    readFile("save_file.txt", "utf-8")
        .then(dades => {
            const dadesJSON = JSON.parse(dades)
            const aforamentsActuals = dadesJSON.tasques_logistiques
            let placesSuficients = true

            // Mirem si hi ha places
            for (const dia in aforamentsActuals) {
                for (const tasca of aforamentsActuals[dia]) {
                    if (tasques_demanades.includes(tasca.id)) {
                        if (tasca.places_lliures <= 0) {
                            placesSuficients = false
                        }
                    }
                }
            }

            // Avortem si no n'hi ha suficients
            if (!placesSuficients) {
                res.status(409).json(dadesJSON)
                return Promise.reject("COL·LISIÓ")
            }

            // Restem les places
            for (const dia in aforamentsActuals) {
                for (const tasca of aforamentsActuals[dia]) {
                    if (tasques_demanades.includes(tasca.id)) {
                        tasca.places_lliures--;
                    }
                }
            }

            // Guardem el fitxer
            return writeFile("save_file.txt", JSON.stringify(dadesJSON, null, 2))
        })
        .then(() => {
            res.status(200).json({ success: true })
        })
        .catch(error => {
            if (error !== "COL·LISIÓ") {
                console.error("Error crític", error);
                if(!res.headersSent) res.status(500).json({ error: "Error de servidor" })
            }
        })
});

app.listen(PORT, () => {
    console.log(`Backend escoltant al port ${PORT}`);
});