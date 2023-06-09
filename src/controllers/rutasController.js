const { DATE } = require("mysql/lib/protocol/constants/types")

const controller = {}

controller.list = (req,res)=>{
    req.getConnection((err,conn)=>{
        msj=""
        conn.query('SELECT * FROM clientes',(err,rows)=>{
            if(err){
                res.json(err)
            }
            res.render('vistaContainer',{
                data: rows,msj
            });
        })
    })
}
controller.modificarCliente =  (req,res)=>{
    var cliente = req.body.elegido
    var user = req.session.mi_sesion
    msj=""
    data = req.session.adoptados
    console.log(cliente)
    req.getConnection((err,conn)=>{
        sql ="SELECT * FROM clientes where email = ?"
        conn.query(sql,[cliente], (err,rows)=>{
            if(err){
                console.log(err)
            }
            var value = rows
            req.session.clientevalue = cliente
            res.render('updateCliente',{data1:value,user:user,msj,data:data})
            
        });
    });
    
}
controller.update_cliente = (req,res)=>{
    var user = req.session.mi_sesion
    var data = req.session.adoptados
    var nombre = req.body.nombre
    var email = req.body.email
    var password = req.body.password
    var telefono = req.body.telefono
    let value = req.session.clientevalue
    if(validarPassword(password)){
        req.getConnection((err,conn)=>{
            console.log("entra")
            sql1 = "SELECT email FROM clientes where email = ?"
            conn.query(sql1,[email],(err,rows)=>{
                if(err){
                    console.log(err)
                }
                console.log(rows)
                if(rows.length==1)
                {
                    if(rows[0].email == value){
                       
                        sql = "UPDATE `clientes` SET `nombre`= ?,`email`= ?,`password`= ?,`telefono`= ? WHERE email = ?"
                        conn.query(sql,[nombre,email,password,telefono,value],(err,rows)=>{});
                        msj ="Ususario actualizado"
                        res.render ('vistaContainer',{user:user,data,msj})
                                
                    }
                    msj ="Email ya esta en uso, usuario no actualizado"
                    res.render ('vistaContainer',{user:user,data,msj})
                }
                sql = "UPDATE `clientes` SET `nombre`= ?,`email`= ?,`password`= ?,`telefono`= ? WHERE email = ?"
                conn.query(sql,[nombre,email,password,telefono,value],(err,rows)=>{});
                msj ="Ususario actualizado"
                res.render ('vistaContainer',{user:user,data,msj})

               
            })
    });
}else{
    var msj="La contraseña debe tener minimo 8 caracteres e incluir 1 letra mayuscula, 1 letra minuscula y 1 numero "
    res.render('updateCliente',{data1:value,user,msj,data})
}


}

controller.verificar= (req,res)=>{
    var mail= req.body.email
    var actpas= req.body.pass1
    var confirmpas = req.body.confirmpass1
    sql="SELECT * FROM clientes WHERE email = ? and password = ?"
    req.getConnection((err,conn)=>{
        conn.query(sql,[mail,actpas],(err,rows)=>{
           
            var data = req.session.adoptado
            var user =""
            var msj ="Mail y/o contraseña invalido/s, no se actualizo la contraseña"
            if(rows == 0){
                res.render('verificar',{msj})
            }else{
            if(rows.length>0){

                if (confirmpas.length>7) {
                    
                 if(validarPassword(confirmpas)){
                    msj ="Contraseña actualizada"
                    sql2 = "update clientes set password =? where email= ?"
                    conn.query(sql2,[confirmpas,mail],(err,rows)=>{
                            res.render('vistaContainer',{user,data,msj})
                    })
                 }else{
                    msj="La contraseña debe tener minimo 8 caracteres e incluir 1 letra mayuscula, 1 letra minuscula y 1 numero "
                    res.render('verificar',{msj})
                }
            }else{
                msj="La contraseña debe tener minimo 8 caracteres e incluir 1 letra mayuscula, 1 letra minuscula y 1 numero "
                res.render('verificar',{msj})
            }
        } 
        
    }});
});
    }
function validarPassword(password){
        const expresion = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        console.log(password)
        let res = expresion.test(password)
        console.log(res)
        if(res) {
            
          return true;
    
        } else {
            
            return false;
        }
    
    }
    controller.add_adopcion = (req, res) => {
        var user = req.session.mi_sesion
        var titulo = req.body.titulo
        var nombre = req.body.nombre
        var edad = req.body.edad
        var raza = req.body.raza
        var tamaño = req.body.tamaño
        var texto = req.body.txtArea
        var telefono = req.body.telefono
        var value= [titulo,nombre,edad,raza,tamaño,null,texto,user[0].email,telefono]
        req.getConnection((err,conn)=>{
        sql = "INSERT INTO perrosenadopcion(nombredepublicacion, nombre, edad, raza, tamaño, id, texto, cliente, telefono) VALUES (?,?,?,?,?,?,?,?,?)"
        conn.query(sql,value, (err,rows)=>{
            if(err) {
                res.send('hubo un error')
                return
            }
            data=req.session.adoptados
            msj=""
          res.render('vistaContainer', {user,data,msj})
        })
    })
    
    }

controller.listarAdopcion = (req,res)=>{
    req.getConnection((err,conn)=>{
        var user = req.session.mi_sesion
        conn.query('SELECT * FROM perrosenadopcion',(err,rows)=>{
            if (err){
                res.json(err)
            }
            req.session.adopcion=rows   
            res.render('adopcion',{data:rows,user})
        });
    });
}


controller.listarPaseadores = (req, res) => {
    orderBy = req.query.orderBy;
    pagina = parseInt(req.query.pagina);
    if (!(Number(pagina) > 0)) {
        pagina = 1;
    }
    var sql = 'SELECT * FROM paseadores ORDER BY id DESC LIMIT ? ,10;'
    if (orderBy=='rating'){
        sql='SELECT * FROM paseadores ORDER BY puntos/calificaciones DESC LIMIT ? ,10;';
    }
    sql += 'SELECT COUNT(id) AS x FROM paseadores  WHERE id<(SELECT id FROM paseadores  LIMIT ? ,1 );'
    sql += 'SELECT COUNT(id) AS x FROM paseadores  WHERE id>(SELECT id FROM paseadores  LIMIT ? ,1 )'
    primero = ((pagina - 1) * 10);
    ultimo = ((pagina) * 10 - 1);
    req.getConnection((err, conn) => {
        msj = ""
        conn.query('SELECT * FROM clientes', (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.render('vistaContainer', {
                data: rows, msj
            });
        })
    })
}

controller.buscarPorNombre = (req,res) => {
    const nombre = req.body.name
    console.log(nombre)
    req.getConnection((err,conn)=>{
        conn.query('SELECT * FROM clientes WHERE nombre = ?',[nombre],(err,rows)=>{
            res.render('listaClientes',{
                data1:rows,user
            })
        })
    })
}

controller.misDatos = (req,res) => {
    req.getConnection((err,conn)=> {
        let  user = req.session.mi_sesion
        let  mascotas = []; 
        let rows =[];
        conn.query('SELECT * FROM mascotas WHERE cliente = ?',[user[0].email],(err,data)=>{
             mascotas = data;
        })
        conn.query('SELECT * FROM clientes WHERE email = ?',[user[0].email],(err,data1)=>{
             rows = data1
             res.render('verInforPersonal',{
                rows,user,mascotas
            });
        })
    })
}

controller.verVacunas = (req,res) =>{
    const cliente = req.body.cliente
    const perro = req.body.perro
    req.getConnection ((err,conn)=>{
        user = req.session.mi_sesion
        conn.query("SELECT * FROM mascotas WHERE cliente=? AND nombre=?",[cliente,perro],(err,rows)=>{
            res.render('verVacunasPerro',{user,perro:rows})
        })
    })
}

controller.modificarVacunasPerroVentana = (req,res)=>{
    const p = req.body.perro
    const cliente = req.body.cliente
    req.getConnection((err,conn)=>{
        user = req.session.mi_sesion
        conn.query("SELECT * FROM mascotas  WHERE nombre = ? AND cliente =?",[p,cliente],(err,rows)=>{
            res.render('modificarVacunasVentana',{user,perro:rows})
        })
    })

}

controller.modificarVacunasPerro =(req,res)=>{
    const p =req.body.perro 
    var cliente = req.body.cliente
    console.log(p, cliente)
    var a= req.body.a
    if(!a){
        a=null
    }
    console.log(a)
    var b= req.body.b
    if(!b){
        b=null
    }
    console.log(b)
    var d = req.body.desparacitacion
    if(!d){
        d=null
    }
    console.log(d)
    req.getConnection((err,conn)=>{
        user = req.session.mi_sesion
        conn.query("UPDATE mascotas SET a=?,b=?,desparacitacion=? WHERE nombre=? AND cliente=?",[a,b,d,p,cliente],(err,rows)=>{
           conn.query("SELECT * FROM mascotas WHERE nombre=? AND cliente=?",[p,cliente],(err,r)=>{
            res.render('verVacunasPerro',{user,perro:r})
           })
        })
    })
}


controller.verPerrosCliente = (req,res) => {
    const  cliente = req.body.cliente 
    req.getConnection((err,conn)=> {
        user =req.session.mi_sesion
        console.log(cliente)
        let nombre = [];
        let mascotas = []
        conn.query('SELECT * FROM mascotas WHERE cliente = ?',[cliente],(err,data)=>{
             mascotas = data;
        })
        conn.query('SELECT * FROM clientes WHERE email= ?',[cliente],(err,data1)=>{
            nombre = data1;
            res.render('perrosCliente',{
                mascotas,user,nombre
             })
       })  
    })
}

controller.eliminarCliente = (req,res) =>{
    const cliente = req.body.elegido;
    console.log(cliente)
    req.getConnection((err,conn)=>{
        conn.query('DELETE FROM clientes WHERE email=?',[cliente],(err,result)=>{
            if(err){
                console.log("no se pudo")
            }
            res.redirect('/listar');
        })
    })
}

controller.listarClientes = (req,res)=>{
    req.getConnection((err,conn)=>{
        msj=""
        user =req.session.mi_sesion
        conn.query('SELECT * FROM clientes',(err,clientes)=>{
            if(err){
                res.json(err)
            }

            console.log(clientes)
            res.render('listaClientes',{
                data1:clientes,user
            });
        })
    })
}
controller.PagePublicaciones = (req,res)=>{
    req.getConnection((err,conn)=>{
        user = req.session.mi_sesion
            res.render('publicaciones',{
               user
            });
        
    })
}

controller.UserPublics = (req,res) => {
    const user = req.session.mi_sesion
    const email = user[0].email
    console.log(email)
    req.getConnection((err,conn)=>{
        let data =[]
        conn.query('SELECT * FROM perrosperdidos    WHERE emailpublicacion = ?',[email],(err,r)=>{
            data = r;
          })
        conn.query('SELECT * FROM perrosenadopcion WHERE perrosenadopcion.cliente = ? ',[email],(err,rows)=>{
            console.log(rows)
            res.render('misPublics',{
                data1:rows,user: user,data
            });
        })
    })
}


controller.verTurnos = (req,res)=>{
    req.getConnection((err,conn)=>{
        msj=""
        conn.query('SELECT * FROM turnos',(err,clientes)=>{
            if(err){
                res.json(err)
            }
            res.render('turnos',{
                data:turnos,user
            });
        })
    })
}
controller.calendarioTurnos = (req,res)=>{
    req.getConnection((err,conn)=>{
        msj=""
        conn.query('SELECT * FROM turnos',(err,data)=>{
            if(err){
                res.json(err)
            }
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const daysInMonth = new Date(currentYear, currentMonth , 0).getDate();
            // Crear el vector "conteoDias" con valores iniciales en cero
            const conteoDias = new Array(daysInMonth).fill(0);
          
            // Recorrer el vector "data" y actualizar el conteo de días
            for (const date of data) {
              if (date.dia.getMonth() === currentMonth && date.dia.getFullYear() === currentYear) {
                const day = date.dia.getDate();
                conteoDias[day] = conteoDias[day] + 1;
              }
            }
            res.render('calendarioTurnos',{
                data1:conteoDias,user,mesActual:currentMonth
            });
        })
    })
}
controller.verturnosdiax = (req,res) => {
    const dia = req.body.dia
    console.log(dia)
    const fechaActual = new Date();
    const añoActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth();
    const date = new Date(añoActual, mesActual, dia)

    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const fechaFinal = `${year}-${month}-${day}`;
    console.log(fechaFinal)
    const user = req.session.mi_sesion
    req.getConnection((err,conn)=> {
        conn.query('SELECT * FROM turnos WHERE dia = ?',[fechaFinal],(err,rows)=>{
            res.render('turnos',{
                data: rows, user
            })
        })
    })
}





controller.listarPaseadores = (req, res) => {
    var user = req.session.mi_sesion
    var sql = 'SELECT * FROM paseadores';
    req.getConnection((err, conn) => {
        conn.query(sql, (err, rows) => {
            res.render('listaPaseadores', {
                data: rows,
                user: user
            });
        })
    })
}
controller.listarPerrosPerdidos = (req, res) => {
    var user = req.session.mi_sesion
    var sql = 'SELECT * FROM `perrosperdidos` WHERE 1 ORDER BY id DESC'
    req.getConnection((err, conn) => {
        conn.query(sql, (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.render('listaPerroPerdido', {
                data: rows,
                user: user
            });
        })
    })
}
controller.listarSolicitudes = (req, res) => {
    var user= req.session.mi_sesion
    console.log(user[0].esAdmin)
    if ((!user) || (user[0].esAdmin==1)){
        res.redirect('/')
    }else{
        var sql = "SELECT s.nombre as nombre, telefono,p.nombre as nombrePaseador, p.id as id, p.mail as mail FROM solicitudescontacto s INNER JOIN paseadores p ON s.idPaseador=p.id;"
        req.getConnection((err, conn) => {
            conn.query(sql, (err, rows) => {
                if (err) {
                    res.json(err)
                } 
                res.render('listaSolicitudes', {
                    data: rows,
                       user:user,
                });
            })
        })
    }

}
 
 controller.solicitarVentanaTurno = (req,res) => {
     req.getConnection((err,conn)=>{
         user = req.session.mi_sesion
         conn.query('SELECT * FROM solicitudesturno WHERE solicitudesturno.usuario = ?',[user[0].email],(err,rows)=>{
            if(rows.length != 0 ){              
              var data = rows
              res.render('miSolicitud',{user,data})
             console.log(rows)
            }
            else{
                conn.query('SELECT * FROM mascotas WHERE  cliente =?',[user[0].email],(err,rows)=>{
                    res.render('solicitarTurno',{
                        user,mascotas:rows
                    })
                })
            }
        })
     })
 }

 controller.verSolicitudesTurnoVentana = (req,res) => {
     req.getConnection((err,conn)=>{
         user = req.session.mi_sesion
         conn.query('SELECT * FROM solicitudesturno',(err,rows)=>{
             if(err){
                 res.json(err)
             }
             res.render('verSolicitudesTurnos',{
                 data:rows,user
             });
         })
     })
 }
 
controller.elegirClienteTurno = (req, res) => {
    req.getConnection((err,conn)=>{
        conn.query('SELECT * FROM clientes',(err,rows)=>{
            console.log(rows)
            res.render('elegirClienteParaTurno',{

                data:rows,user
            })
    })
    })
}


controller.darTurnos = (req, res) => {
     req.getConnection((err, conn) => {
         user=req.session.mi_sesion
         usuario=req.body.cliente
         servicio=" "
         tipo=" "            
         conn.query('SELECT * FROM mascotas WHERE mascotas.cliente = ?',[usuario],(err,rows)=>{            
            mascotas = rows;
            res.render('darTurno',{
             user,usuario,servicio,tipo,mascotas
         });
     })
 })
}

 controller.Turnos= (req, res) => {
     req.getConnection((err,conn)=>{
         msj=""
         user =req.session.mi_sesion
         // Obtén la fecha actual
    const fechaActual = new Date();

    // Resta un día a la fecha actual
    const fechaAnterior = new Date(fechaActual);
    fechaAnterior.setDate(fechaActual.getDate() - 1);

    // Obtiene los componentes de la fecha anterior
    const anio = fechaAnterior.getFullYear();
    const mes = fechaAnterior.getMonth() + 1; // Los meses van de 0 a 11, por lo que se suma 1
    const dia = fechaAnterior.getDate();

    // Formatea la fecha en el formato "año/mes/dia"
    const fechaFormateada = `${anio}/${mes.toString().padStart(2, '0')}/${dia.toString().padStart(2, '0')}`;

    // Utiliza la fecha formateada en tu consulta de base de datos
    const consulta = "SELECT * FROM turnos WHERE dia > ?";
         conn.query(consulta,[fechaFormateada],(err,rows)=>{
             if(err){
                 res.json(err)
             }
             res.render('turnos',{                 
                 data: rows,user
             });
         })
     })
 }
 
 controller.misTurnos= (req, res) => {
     req.getConnection((err,conn)=>{
         user = req.session.mi_sesion
         email = user[0].email
               // Obtén la fecha actual
    const fechaActual = new Date();

    // Resta un día a la fecha actual
    const fechaAnterior = new Date(fechaActual);
    fechaAnterior.setDate(fechaActual.getDate() - 1);

    // Obtiene los componentes de la fecha anterior
    const anio = fechaAnterior.getFullYear();
    const mes = fechaAnterior.getMonth() + 1; // Los meses van de 0 a 11, por lo que se suma 1
    const dia = fechaAnterior.getDate();

    // Formatea la fecha en el formato "año/mes/dia"
    const fechaFormateada = `${anio}/${mes.toString().padStart(2, '0')}/${dia.toString().padStart(2, '0')}`;

    // Utiliza la fecha formateada en tu consulta de base de datos
    const consulta = "SELECT * FROM turnos WHERE dia > ? AND paciente=?";
         conn.query(consulta,[fechaFormateada,email],(err,rows)=>{
             res.render('misTurnos',{
                 data:rows,user           
             });
         })
     })
 }



controller.eliminarSolicitud = (req, res) => {
    req.getConnection((err, conn) => {

        var id = req.body.id;
        var telefono = req.body.telefono;
        var sql = "DELETE FROM `solicitudescontacto` WHERE idPaseador= ? AND telefono= ? "
        conn.query(sql, [id, telefono], (err, rows) => {
            console.log(rows)
            if (err) {
                res.json(err)
            }
            res.send(rows)
        })
    })
}

controller.agregarVetTurno =(req,res)=>{
    req.getConnection((err,conn)=>{
        user = req.session.mi_sesion;
        text=null
        conn.query('SELECT * FROM  veterinarias',(err,rows)=>{         
            res.render('agregarVeterinariaDeTurno',{
                user,rows,text});  
         });
    })
}

controller.agregarDiaTurnoVeterinariaVentana =(req,res)=>{
    req.getConnection((err,conn)=>{
        user = req.session.mi_sesion
        text=null;
        conn.query("SELECT * FROM veterinarias",(err,rows)=>{
            veterinarias = rows
            res.render('agregarDiaTurnoVeterinaria',{
            user,text,veterinarias 
        })    
        })
    })
}



controller.verVeterinariasTurnoCargadas = (req,res)=>{
    req.getConnection((err,conn)=>{
        user = req.session.mi_sesion
        conn.query("SELECT * FROM veterinarias",(err,rows)=>{
            res.render('listadoVeterinariasDeTurno',{              
                user,data1:rows
            })
        })
    })
}
controller.eliminarVeterinariaDeTurno = (req,res)=>{
    req.getConnection((err,conn)=>{
        user = req.session.mi_sesion
        const nombre = req.body.veterinaria
        conn.query("DELETE FROM veterinarias WHERE nombre=?",[nombre],(err,rows)=>{
                res.redirect('/verVeterinariasTurnoCargadas')
        })
    })
}

controller.calendarioVeterinariasDeTurno = (req,res)=>{
    req.getConnection((err,conn)=>{
        msj=""
        conn.query('SELECT * FROM turnodeveterinaria',(err,data)=>{
            if(err){
                res.json(err)
            }
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const daysInMonth = new Date(currentYear, currentMonth , 0).getDate();
            // Crear el vector "conteoDias" con valores iniciales en cero
            const conteoDias = new Array(daysInMonth).fill(0);
          
            // Recorrer el vector "data" y actualizar el conteo de días
            for (const date of data) {
              if (date.dia.getMonth() === currentMonth && date.dia.getFullYear() === currentYear) {
                const day = date.dia.getDate();
                conteoDias[day] = conteoDias[day] + 1;
              }
            }
            res.render('calendarioVeterinariasTurno',{
                data1:conteoDias,user,mesActual:currentMonth
            });
        })
    })
}

controller.verVeterinariasTurnoDiaX = (req,res)=>{
    const dia = req.body.dia
    console.log(dia)
    const fechaActual = new Date();
    const añoActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth();
    const date = new Date(añoActual, mesActual, dia)

    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const fechaFinal = `${year}-${month}-${day}`;
    console.log(fechaFinal)
    req.getConnection((err,conn)=> {
        user = req.session.mi_sesion;
        conn.query("SELECT * FROM veterinarias JOIN turnodeveterinaria  ON veterinarias.nombre = turnodeveterinaria.nombreVeterinaria WHERE turnodeveterinaria.dia = ?",[fechaFinal],(err,rows)=>{
            
            res.render('verVeterinariasTurnoDiaX',{
                user,data1: rows,fechaFinal
            })
        })
    })
}

controller.guardarVeterinariaModificada = (req,res)=>{
    const nombre = req.body.nombre;
    const numero = req.body.telefono;
    const direccion = req.body.direccion;
    req.getConnection((err,conn)=>{
        conn.query("UPDATE veterinarias SET numero=?, direccion = ? WHERE nombre = ?",[numero,direccion,nombre],(err,rows)=>{
            res.redirect('/verVeterinariasTurnoCargadas')
        })
    })
}

controller.modificarVeterinariaDeTurno  = (req,res) =>{
    const nombre = req.body.veterinaria
    req.getConnection((err,conn)=>{
        user=req.session.mi_sesion
        conn.query("SELECT * FROM veterinarias WHERE nombre=?",[nombre],(err,rows)=>{
            res.render('modificarVeterinariaTurno',{
                user,data:rows
            })
        })
    })
}

controller.eliminarDiaVeterinariaTurno = (req,res)=>{
    const nombre = req.body.veterinaria
    const fecha = req.body.dia
    req.getConnection((err,conn)=>{
        conn.query("DELETE FROM turnodeveterinaria WHERE nombreVeterinaria=? AND dia=?",[nombre,fecha],(err,rows)=>{
            res.redirect('/')
        })
    })
}

controller.agregarVeterinariaDeTurno = (req,res)=> {
    const nombre = req.body.nombre;
    const telefono = req.body.telefono;
    const direccion = req.body.direccion;

    req.getConnection((err,conn)=>{
        user = req.session.mi_sesion;
        conn.query("SELECT * FROM veterinarias WHERE nombre=?",[nombre],(err,rows)=>{
            if(rows.length>0){
                text = "veterinaria de turno ya registrada, pruebe con otra"
                res.render('agregarVeterinariaDeTurno',{
                    user,rows,text
                })
            }else{
        conn.query("INSERT INTO veterinarias (nombre, numero, direccion) VALUES (?,?,?)",[nombre,telefono,direccion],(err,rows)=>{
                text = "veterinaria de turno cargada"
                res.render('agregarVeterinariaDeTurno',{
                    user,rows,text
                })
        })
        }   
        })
    })
}

controller.agregarDiaTurnoVeterinaria = (req,res) => {
    const nombre = req.body.veterinariaElegida;
    const fechaOriginal = req.body.dia;
    console.log(fechaOriginal)
    req.getConnection((err,conn)=>{
        user = req.session.mi_sesion;
        conn.query('SELECT * FROM turnodeveterinaria WHERE nombreVeterinaria=? AND  dia=?',[nombre,fechaOriginal],(err,rows)=>{
            if(rows.length>0){
                text="La veterinaria "+nombre+ " ya poseía turno para la fecha "+fechaOriginal+", cambie de fecha o de veterinaria";
                res.render("agregarDiaTurnoVeterinaria",{
                    user,text
                })
            }else{
                conn.query('INSERT INTO turnodeveterinaria (nombreVeterinaria,dia) VALUES (?,?)',[nombre,fechaOriginal],(err,rows)=>{
                    text="Se guardo la veterinaria "+nombre+ " para estar de turno en la fecha "+fechaOriginal;
                    res.render("agregarDiaTurnoVeterinaria",{
                        user,text
                    })
                })
            }
        })  
    })
}

controller.solicitarPaseador = (req, res) => {
    req.getConnection((err, conn) => {
        var nombre = req.body.nombre
        var telefono = req.body.telefono
        var id = req.body.id

        var sql = "INSERT INTO `solicitudescontacto` (`telefono`, `idPaseador`, `nombre`) VALUES (?, ?, ?) "
        conn.query(sql, [telefono, id, nombre], (err, rows) => {
            if (err) {
                res.send(err)
            }
            res.send(rows)
        })
    })


}
controller.eliminarPaseador = (req, res) => {
    req.getConnection((err, conn) => {
        var id = req.body.id;
        var sql = "DELETE FROM `paseadores` WHERE id= ? "
        conn.query(sql, [id], (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.send(rows)
        })
    })
}
controller.agregarPaseador = (req, res) => {
    req.getConnection((err, conn) => {
        var nombre = req.body.nombre;
        var esPaseador = req.body.esPaseador ? 1 : 0;
        var esCuidador = req.body.esCuidador ? 1 : 0;
        var mail = req.body.mail;
        var descripcion = req.body.descripcion;
        var zonas = req.body.zonas;
        var lunesManiana = req.body.lunesManiana ? 1 : 0;
        var martesManiana = req.body.martesManiana ? 1 : 0;
        var miercolesManiana = req.body.miercolesManiana ? 1 : 0;
        var juevesManiana = req.body.juevesManiana ? 1 : 0;
        var viernesManiana = req.body.viernesManiana ? 1 : 0;
        var sabadoManiana = req.body.sabadoManiana ? 1 : 0;
        var domingoManiana = req.body.domingoManiana ? 1 : 0;
        var lunesTarde = req.body.lunesTarde ? 1 : 0;
        var martesTarde = req.body.martesTarde ? 1 : 0;
        var miercolesTarde = req.body.miercolesTarde ? 1 : 0;
        var juevesTarde = req.body.juevesTarde ? 1 : 0;
        var viernesTarde = req.body.viernesTarde ? 1 : 0;
        var sabadoTarde = req.body.sabadoTarde ? 1 : 0;
        var domingoTarde = req.body.domingoTarde ? 1 : 0;
        var lunesNoche = req.body.lunesNoche ? 1 : 0;
        var martesNoche = req.body.martesNoche ? 1 : 0;
        var miercolesNoche = req.body.miercolesNoche ? 1 : 0;
        var juevesNoche = req.body.juevesNoche ? 1 : 0;
        var viernesNoche = req.body.viernesNoche ? 1 : 0;
        var sabadoNoche = req.body.sabadoNoche ? 1 : 0;
        var domingoNoche = req.body.domingoNoche ? 1 : 0;
        var sql = 'INSERT INTO `paseadores`(`nombre`,`esCuidador`,`esPaseador`,`mail`, `descripcion`, `zonas`, `lunesManiana`, `lunesTarde`, `lunesNoche`, `martesManiana`, `martesTarde`, `martesNoche`, `miercolesManiana`, `miercolesTarde`, `miercolesNoche`, `juevesManiana`, `juevesTarde`, `juevesNoche`, `viernesManiana`, `viernesTarde`, `viernesNoche`, `sabadoManiana`, `sabadoTarde`, `sabadoNoche`, `domingoManiana`, `domingoTarde`, `domingoNoche`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        conn.query(sql, [nombre, esCuidador, esPaseador, mail, descripcion, zonas, lunesManiana, lunesTarde, lunesNoche, martesManiana, martesTarde, martesNoche, miercolesManiana, miercolesTarde, miercolesNoche, juevesManiana, juevesTarde, juevesNoche, viernesManiana, viernesTarde, viernesNoche, sabadoManiana, sabadoTarde, sabadoNoche, domingoManiana, domingoTarde, domingoNoche], (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.redirect('/paseadores')
        })
    })
}
controller.modificarPaseador = (req, res) => {
    var id = req.query.id
    var nombre = req.body.nombre;
    var mail = req.body.mail;
    var esPaseador = req.body.esPaseador ? 1 : 0;
    var esCuidador = req.body.esCuidador ? 1 : 0;
    var descripcion = req.body.descripcion;
    var zonas = req.body.zonas;
    var lunesManiana = req.body.lunesManiana ? 1 : 0;
    var martesManiana = req.body.martesManiana ? 1 : 0;
    var miercolesManiana = req.body.miercolesManiana ? 1 : 0;
    var juevesManiana = req.body.juevesManiana ? 1 : 0;
    var viernesManiana = req.body.viernesManiana ? 1 : 0;
    var sabadoManiana = req.body.sabadoManiana ? 1 : 0;
    var domingoManiana = req.body.domingoManiana ? 1 : 0;
    var lunesTarde = req.body.lunesTarde ? 1 : 0;
    var martesTarde = req.body.martesTarde ? 1 : 0;
    var miercolesTarde = req.body.miercolesTarde ? 1 : 0;
    var juevesTarde = req.body.juevesTarde ? 1 : 0;
    var viernesTarde = req.body.viernesTarde ? 1 : 0;
    var sabadoTarde = req.body.sabadoTarde ? 1 : 0;
    var domingoTarde = req.body.domingoTarde ? 1 : 0;
    var lunesNoche = req.body.lunesNoche ? 1 : 0;
    var martesNoche = req.body.martesNoche ? 1 : 0;
    var miercolesNoche = req.body.miercolesNoche ? 1 : 0;
    var juevesNoche = req.body.juevesNoche ? 1 : 0;
    var viernesNoche = req.body.viernesNoche ? 1 : 0;
    var sabadoNoche = req.body.sabadoNoche ? 1 : 0;
    var domingoNoche = req.body.domingoNoche ? 1 : 0;
    req.getConnection((err, conn) => {
        var sql = "UPDATE `paseadores` SET `nombre`=?,`esCuidador`=?,`esPaseador`=?,`mail`=?,`descripcion`=?,`zonas`=?,`lunesManiana`=?,`lunesTarde`=?,`lunesNoche`=?,`martesManiana`=?,`martesTarde`=?,`martesNoche`=?,`miercolesManiana`=?,`miercolesTarde`=?,`miercolesNoche`=?,`juevesManiana`=?,`juevesTarde`=?,`juevesNoche`=?,`viernesManiana`=?,`viernesTarde`=?,`viernesNoche`=?,`sabadoManiana`=?,`sabadoTarde`=?,`sabadoNoche`=?,`domingoManiana`=?,`domingoTarde`=?,`domingoNoche`=? WHERE id=?"
        conn.query(sql, [nombre, esCuidador, esPaseador, mail, descripcion, zonas, lunesManiana, lunesTarde, lunesNoche, martesManiana, martesTarde, martesNoche, miercolesManiana, miercolesTarde, miercolesNoche, juevesManiana, juevesTarde, juevesNoche, viernesManiana, viernesTarde, viernesNoche, sabadoManiana, sabadoTarde, sabadoNoche, domingoManiana, domingoTarde, domingoNoche, id], (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.redirect('/paseadores')
        })
    })
}   
controller.calificarPaseador = (req, res) => {
    req.getConnection((err, conn) => {
        var id = req.body.id;
        var calificacion = req.body.calificacion;
        var sql = 'UPDATE `paseadores` SET `puntos`=puntos+?,`calificaciones`=calificaciones+1 WHERE id=?'
        conn.query(sql, [calificacion, id], (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.send(rows);
        })
    })
}
controller.agregarPaseadores = (req, res) => {
    var user= req.session.mi_sesion
    if ((!user) || (user.esAdmin==1)){
        res.redirect('/')
    }else{
        res.render('agregarPaseador',{user: user})
}
    }
    
controller.eliminarPaseador = (req, res) => {
    req.getConnection((err, conn) => {

        var id = req.body.id;

        var sql = "DELETE FROM `paseadores` WHERE id= ? "
        conn.query(sql, [id], (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.send(rows)
        })
    })
}

controller.modificar = (req, res) => {
    var user= req.session.mi_sesion
    if ((!user) || (user.esAdmin==1)){
        res.redirect('/')
    }else{
        id = req.query.id;
        var sql = 'SELECT * FROM paseadores WHERE id = ?';
        req.getConnection((err, conn) => {
            conn.query(sql, id, (err, rows) => {
                if (err) {
                    res.json(err)
                }
                res.render('modificarPaseador', {
                    data:rows ,
                    user:user
                });
            })
        })
}
}
controller.delete_adopcion = (req, res) => { 
    var id = req.params.id;
    req.getConnection((err, conn) => {
        conn.query('DELETE FROM  perrosenadopcion WHERE id = ?;', [id],(err, rows) => { 
            res.redirect('/adopcion')
        })
    })
}
controller.modificarPerrosPerdidos = (req, res) => {
    req.getConnection((err, conn) => {
        console.log(req.file);
        var id=req.body.id;
        var nombre = req.body.nombre;
        var descripcion = req.body.descripcion;
        var zona = req.body.zona;
        var fecha = req.body.fecha==""?req.body.fechavieja:req.body.fecha;
        var emailpublicacion = req.body.emailpublicacion;
        var sexo = req.body.sexo;
        var perdidooencontrado = req.body.perdidooencontrado;
        var contacto = req.body.contacto;
        var foto = req.file?req.file.filename:req.body.imagenVieja;
        var sql = 'UPDATE `perrosperdidos` SET `nombre`=?,`descripcion`=?,`foto`=?,`contacto`=?,`zona`=?,`perdidooencontrado`=?,`sexo`=?,`fecha`=? WHERE id=?'
        conn.query(sql, [nombre, descripcion, foto, contacto, zona, perdidooencontrado, sexo, fecha, id], (err, rows) => {
            if (err) {
                res.json(err)
            } else {
                res.redirect('/perrosPerdidos')
            }
        })
    })
}
controller.modificarPerroPerdido = (req, res) => {
    {
        var user = req.session.mi_sesion
        if ((!user) || (user.esAdmin == 1)) {
            res.redirect('/')
        } else {
            id = req.query.id;
            var sql = 'SELECT * FROM perrosperdidos WHERE id = ?';
            req.getConnection((err, conn) => {
                conn.query(sql, id, (err, rows) => {
                    if (err) {
                        res.json(err)
                    }
                    res.render('modificarPerroPerdido', {
                        data: rows,
                        user: user
                    });
                })
            })
        }
    }
}
controller.eliminarPerroPerdido = (req, res) => {
    req.getConnection((err, conn) => {

        var id = req.body.id;
        var sql = "DELETE FROM `perrosperdidos` WHERE id= ? "
        conn.query(sql, [id], (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.send(rows)
        })
    })
}
controller.agregarPerroPerdido = (req, res) => {
    req.getConnection((err, conn) => {
        console.log(req.file)
        var nombre = req.body.nombre;
        var descripcion = req.body.descripcion;
        var zona = req.body.zona;
        var fecha = req.body.fecha;
        var emailpublicacion = req.body.emailpublicacion;
        var sexo = req.body.sexo;
        var perdidooencontrado = req.body.perdidooencontrado;
        var contacto = req.body.contacto;
        var foto = req.file.filename;
        var sql = 'INSERT INTO `perrosperdidos` (`nombre`, `descripcion`, `foto`, `contacto`, `zona`, `emailpublicacion`, `perdidooencontrado`, `sexo`, `fecha` ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) '
        conn.query(sql, [nombre, descripcion, foto, contacto, zona, emailpublicacion, perdidooencontrado, sexo, fecha], (err, rows) => {
            console.log('s')
            if (err) {
                res.json(err)
            } else {
                res.redirect('/perrosPerdidos')
            }
        })
    })
}
controller.agregarPerrosPerdidos = (req, res) => {

    var user = req.session.mi_sesion
    if ((!user)) {
        res.redirect('/')
    } else {
        res.render('agregarPerroPerdido', { user: user })
    }
}
controller.verMascotas = (req, res) => {
    var user = req.session.mi_sesion
    var cliente =user[0].email
    req.getConnection((err, conn) => {
        sql ="SELECT clientes.nombre AS nombrecliente, mascotas.nombre AS nombre, detalle FROM mascotas join clientes on mascotas.cliente = ?"
        conn.query(sql,[cliente], (err, rows) => {
            if (err){
                res.json(err)
            }
            else {
                res.render("mis_mascotas", {data:rows,user})
            }
        })
    })
}

controller.adoptado = (req, res) => {
    var id= req.params.id
    req.getConnection((err, conn) => {
       var sql ="INSERT INTO `perrosadoptados`(`titulo`, `nombre`, `texto`) SELECT perrosenadopcion.nombredepublicacion AS titulopubli, perrosenadopcion.nombre AS nobmreperro, perrosenadopcion.texto as detalle from perrosenadopcion WHERE id = ?"
       conn.query (sql, [id], (err, rows) => {
        sql2 ="DELETE FROM perrosenadopcion WHERE id = ?"
        conn.query(sql2,[id],(err,rows)=>{
            console.log(rows)
            res.redirect('/')
        })
        })

        
    })
} 

controller.agregarCampaña = (req, res) => {
    req.getConnection((err, conn) => {
        console.log(req.file)
        var nombreCampania = req.body.nombreCampania;
        var nombreRefugio = req.body.nombreRefugio;
        var descripcion = req.body.descripcion;
        var objetivo = req.body.objetivo;
        var foto = req.file.filename;
        var sql = 'INSERT INTO `campanias`(`nombreCampania`, `nombreRefugio`, `foto`, `descripcion`, `objetivo`) VALUES (?,?,?,?,?)'
         conn.query(sql, [nombreCampania, nombreRefugio, foto, descripcion, objetivo], (err, rows) => {
            console.log('s')
            if (err) {
                res.json(err)
            } else {
                res.redirect('/campanias')
            }
        })
    })
}
controller.agregarCampañas = (req, res) => {
    var user = req.session.mi_sesion
    if ((!user) || (user.esAdmin == 1)) {
        res.redirect('/')
    } else {
        res.render('agregarCampania', { user: user })
    }
}

controller.modificarCampanias = (req, res) => {
    req.getConnection((err, conn) => {
        console.log(req.file);
        var id= req.body.id
        var nombreRefugio = req.body.nombreRefugio;
        var descripcion = req.body.descripcion;
        var objetivo = req.body.objetivo;
        var foto = req.file ? req.file.filename : req.body.imagenVieja;
        var sql = 'UPDATE `campanias` SET `nombreRefugio`=?,`foto`=?,`descripcion`=?,`objetivo`=? WHERE id=?'
        conn.query(sql, [ nombreRefugio, foto, descripcion,objetivo , id], (err, rows) => {
            if (err) {
                res.json(err)
            } else {
                res.redirect('/campanias')
            }
        })
    })
}
controller.modificarCampania = (req, res) => {
    {
        var user = req.session.mi_sesion
        if ((!user) || (user.esAdmin == 1)) {
            res.redirect('/')
        } else {
            id = req.query.id;
            var sql = 'SELECT * FROM campanias WHERE id = ?';
            req.getConnection((err, conn) => {
                conn.query(sql, id, (err, rows) => {
                    if (err) {
                        res.json(err)
                    }
                    res.render('modificarcampania', {
                        data: rows,
                        user: user
                    });
                })
            })
        }
    }
}
controller.eliminarCampania = (req, res) => {
    const id = req.body.id;
    req.getConnection((err, conn) => {
        conn.query('DELETE FROM campanias WHERE id=?', [id], (err, result) => {
            if (err) {
                console.log("no se pudo")
            }
            res.redirect('/campanias');
        })
    })
}
controller.finalizarCampania = (req, res) => {
    const id = req.body.id;
    req.getConnection((err, conn) => {
        conn.query('UPDATE `campanias` SET `finalizada`=1 WHERE id=?', [id], (err, result) => {
            if (err) {
                console.log("no se pudo")
            }
            res.redirect('/campanias');
        })
    })
}
controller.campanias = (req, res) => {
    req.getConnection((err, conn) => {
        var user = req.session.mi_sesion
        conn.query('SELECT * FROM campanias', (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.render('listaCampanias', { data: rows, user })
        });
    });
}
controller.donarForm = (req, res) => {
    id=req.query.id
    req.getConnection((err, conn) => {
        var user = req.session.mi_sesion
        conn.query('SELECT * FROM campanias WHERE id=?',[id], (err, rows) => {
            console.log(rows[0])
            if (err) {
                res.json(err)
            }
            res.render('donar', { data: rows[0], user })
        });
    });
}
controller.donar = (req, res) => {
    var user= req.session.mi_sesion
    cliente=user?user[0].email:makeid(10);
    monto=req.body.monto
    nombreCampania=req.body.nombreCampania
    id=req.body.id
    var sql= 'INSERT INTO `donaciones`(`nombreCampania`, `email`, `montoDonacion`) VALUES (?,?,?)';
    if (user==undefined){sql= 'INSERT INTO `donaciones`(`nombreCampania`, `codigo`, `montoDonacion`) VALUES (?,?,?)';}
    console.log(sql)
    sql+=';UPDATE `campanias` SET `montoActual`=`montoActual`+? WHERE id=?'
    sql+=';UPDATE `campanias` SET `finalizada` = 1 WHERE `campanias`.`id` = ? and `campanias`.`montoActual`>= `campanias`.`objetivo`';
    sql+=';SELECT * FROM campanias'
    req.getConnection((err, conn) => {
        var user = req.session.mi_sesion
        conn.query(sql,[nombreCampania,cliente,monto,monto,id,id], (err, rows) => {
            console.log(rows[0])
            if (err) {
                res.json(err)
            }
            var msj= 'Gracias por donar. En agradecimiento le otorgamos un cupon de descuento de $'+(monto/10)+' que podra usar en su proxima visita a la veterinaria.';
            if (user==undefined){msj='Gracias por donar. En agradecimiento le otorgamos un codigo de descuento de'+(monto/10)+' que podra usar en su proxima visita a la veterinaria. Codigo: '+ cliente;}
            console.log(sql)
            res.render('listaCampanias', { data: rows[3], user, msj})
        });
    });
}
controller.descuentos = (req, res) => {

    var user= req.session.mi_sesion
    email=req.query.email
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM donaciones WHERE email=? AND canjeado=0;SELECT * FROM `clientes` WHERE email=?',[email,email], (err, rows) => {
            console.log(rows[1])
            if (err) {
                res.json(err)
            }
            res.render('descuentos', { data: rows[0],cliente: rows[1], user })
        });
    });
}
controller.misDescuentos = (req, res) => {
    var user= req.session.mi_sesion
    email=req.session.mi_sesion[0].email
    console.log(email)
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM donaciones WHERE email=? AND canjeado=0',[email], (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.render('misDescuentos', { data: rows, user })
        });
    });
}
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}
controller.canjear = (req, res) => {
    id=req.query.id
    var sql= 'UPDATE `donaciones` SET `canjeado`=1 WHERE id=?';
     req.getConnection((err, conn) => {
        var user = req.session.mi_sesion
        conn.query(sql,[id], (err, rows) => {
            if (err) {
                res.json(err)
            }
            res.send('Cupon de descuento canjeado exitosamente')
        });
    });
}
controller.canjearCodigo = (req, res) => {
    id=req.query.codigo
    var sql= 'UPDATE `donaciones` SET `canjeado`=1 WHERE codigo=?';
     req.getConnection((err, conn) => {
        var user = req.session.mi_sesion
        conn.query(sql,[id], (err, rows) => {
            if (err) {
                res.send('Hubo un error')
            }
            res.send('Cupon de descuento canjeado exitosamente')
        });
    });
}
module.exports = controller;









/*-----------------------CODIGO LEGACY-----------------------------------------

controller.iniciar_sesion = (req,res)=>{

   req.getConnection((err,conn)=>{
        
        var mail= req.body.email
        var pas = req.body.password
        var sql ="SELECT * FROM `clientes` WHERE email = ? AND password = ?"
        conn.query(sql,[mail,pas],(err,rows)=>{
            if(err){
                res.json(err)
            }
            if(rows[0].esAdmin === 0){

                res.redirect('/veterinaria_panel',)
            }
            else 
                res.redirect('/cliente_panel')
        })
    })
        
    }




 controller.registro = (req,res)=>{
        req.getConnection((err,conn)=>{
            var nombre= req.body.nombre
            var mail= req.body.email
            var pas = req.body.password
            var esAdmin= false
            var telefono=req.body.telefono

            var sql ="SELECT * FROM `clientes` WHERE email = ?"
            conn.query(sql,[mail],(err,rows)=>{
                if(err){
                    res.json(err)
                }
                if(rows.length > 0){
                    res.json('email ya registrado')
                }
                else{
                    var sql ="INSERT INTO `clientes` (`nombre`, `email`, `password`, `esAdmin`, `telefono`) VALUES (?,?,?,?,?)"
                    conn.query(sql,[nombre,mail,pas,esAdmin,telefono],(err,rows)=>{
                        if(err){
                            res.json(err)
                        }
                        alert("usuario registrado con exito")
                        res.redirect('/')
                    })
                }
            })
        })
    }






*/


