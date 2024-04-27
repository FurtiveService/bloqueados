const pg = require('pg');
const { Pool } = pg;
const dotenv = require('dotenv');
dotenv.config();


const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

// CRAR TABLA
async function crearTabla() {
    const client = await pool.connect();
    try {
        // Ejecutar la consulta de creación de tabla
        const result = await client.query(`
        CREATE TABLE IF NOT EXISTS identificadores (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(255),
          urlPerfil VARCHAR(512),
          urlImagen VARCHAR(512),
          likes INTEGER
        );
      `);

        console.log('Tabla creada correctamente.');
    } catch (error) {
        console.error('Error al crear la tabla:', error);
    } finally {
        client.release();
    }
}



// CONSULTAR
async function realizarConsulta() {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM perfiles');
        console.log(result.rows);
    } finally {
        client.release();
    }
}

//INSERTAR
async function insertarPerfil(perfil) {
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO perfiles (nombre, urlPerfil, urlImagen, likes) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [perfil.nombre, perfil.urlPerfil, perfil.urlImagen, perfil.likes];

        const result = await client.query(query, values);
        console.log('Perfil insertado:', result.rows[0]);
    } finally {
        client.release();
    }
}

// Ejemplo de perfil
const nuevoPerfil = {
    nombre: 'Rodrigo Luna',
    urlPerfil: 'https://www.facebook.com/profile.php?id=100012437911258',
    urlImagen: 'https://scontent.faep8-1.fna.fbcdn.net/v/t39.30808-6/416065467_1811681042589809_8643111564444008811_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=efb6e6&_nc_ohc=CSgnv9G1aVEAX9t-fvc&_nc_ht=scontent.faep8-1.fna&oh=00_AfD-X_gYtE0XMZshenuWEN1tJ182O3HOKn3rTm6ZLV16nw&oe=65A1E89B',
    likes: 1,
};

// ELIMINAR
async function eliminarPerfilPorId(id) {
    const client = await pool.connect();
    try {
        // Ejecutar la consulta de eliminación
        const result = await client.query('DELETE FROM perfiles WHERE id = $1 RETURNING *', [id]);

        // Verificar si se eliminó alguna fila
        if (result.rows.length > 0) {
            console.log('Perfil eliminado:', result.rows[0]);
        } else {
            console.log('No se encontró un perfil con el ID especificado.');
        }
    } catch (error) {
        console.error('Error al eliminar el perfil:', error);
    } finally {
        client.release();
    }
}


// MODIFICAR
async function modificarValorPorId(id, nuevoValor) {
    const client = await pool.connect();
    try {
        // Ejecutar la consulta de actualización
        const result = await client.query('UPDATE perfiles SET nombre = $1 WHERE id = $2 RETURNING *', [nuevoValor, id]);

        // Verificar si se actualizó alguna fila
        if (result.rows.length > 0) {
            console.log('Perfil modificado:', result.rows[0]);
        } else {
            console.log('No se encontró un perfil con el ID especificado.');
        }
    } catch (error) {
        console.error('Error al modificar el perfil:', error);
    } finally {
        client.release();
    }
}

//AGREGAR MULTIPLIES PERFILES

async function insertarPerfiles(perfiles) {
    const client = await pool.connect();
    try {
        // Utilizar Promise.all para ejecutar múltiples consultas en paralelo
        const resultados = await Promise.all(
            perfiles.map(async (perfil) => {
                const query = 'INSERT INTO perfiles (nombre, urlPerfil, urlImagen, likes) VALUES ($1, $2, $3, $4) RETURNING *';
                const values = [perfil.nombre, perfil.urlPerfil, perfil.urlImagen, perfil.likes];
                return client.query(query, values);
            })
        );

        // Imprimir información de los perfiles insertados
        resultados.forEach((result, index) => {
            if (result.rows.length > 0) {
                console.log(`Perfil ${index + 1} insertado:`, result.rows[0]);
            } else {
                console.log(`No se pudo insertar el perfil ${index + 1}.`);
            }
        });
    } catch (error) {
        console.error('Error al insertar perfiles:', error);
    } finally {
        client.release();
    }
}

// Lista de perfiles para insertar (reemplaza con tus datos)
const perfilesParaInsertar = [ 
    { nombre: 'Francesc Muro', urlPerfil: 'https://www.facebook.com/francesc.muro', urlImagen: 'https://scontent.faep8-2.fna.fbcdn.net/v/t1.6435-1/48371154_10157260682792841_1524362401057603584_n.jpg?stp=dst-jpg_p200x200&_nc_cat=104&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=BLDTa5rFcIoAX9l7Unq&_nc_ht=scontent.faep8-2.fna&oh=00_AfDiCRgBES5QxJ4SaZYEI8JmMfQHvcchmyYSdGK-RYE4Rg&oe=65C4BF35', likes: 0 },
];

https://www.facebook.com/photo/?fbid=228449425503514&set=a.108492144165910&__tn__=%3C



// Llamada consultar
//realizarConsulta();

// Llamada insertar  
//insertarPerfil(nuevoPerfil);

// Llamada eliminar
//eliminarPerfilPorId("3"); 

//Llamada modificar
//modificarValorPorId(2, 'Nuevo Valor');

// Llamada crear tabla
//crearTabla();

// Llamada Insertar múltiples perfiles
//insertarPerfiles(perfilesParaInsertar);






