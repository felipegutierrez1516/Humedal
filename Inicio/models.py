from django.db import models

# Create your models here.

class Docente(models.Model):
    nombre = models.CharField('Nombre del Docente', max_length=150, null=False)
    apellido = models.CharField('Apellido del Docente', max_length=150, null=False)
    correo = models.EmailField('Correo del Docente', max_length=150, null=False, unique=True)
    contrasena = models.CharField('Contraseña', max_length=150, null=False)


    def __str__(self):
        return str(self.id) + '-' + self.nombre

class Estudiante(models.Model):
    nombre = models.CharField('Nombre del Estudiante', max_length=150, null=False)
    apellido = models.CharField('Apellido del Estudiante', max_length=150, null=False)
    correo = models.EmailField('Correo del Estudiante', max_length=150, null=False, unique=True)
    contrasena = models.CharField('Contraseña', max_length=150, null=False)

    def __str__(self):
        return str(self.id) + '-' + self.nombre
class Aprendizajeesperado(models.Model):
    nombre = models.CharField('Objetivo', max_length=150, null=False)
    descripcion = models.CharField('Nombre del Curso', max_length=150, null=False)


    def __str__(self):
        return str(self.id) + '-' + self.nombre       
    
class Curso(models.Model):
    nombre = models.CharField('Nombre del Curso', max_length=150, null=False)
    descripcion = models.CharField('Descripción', max_length = 500, null=False)
    programa = models.TextField('Programa Asignatura', max_length=150, null=False)
    estado = models.BooleanField('Estado del Curso', null =False)
    docente= models.ForeignKey(Docente, on_delete=models.CASCADE)
    objetivo = models.ForeignKey(Aprendizajeesperado, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.id) + '-' + self.nombre
        

        
class Progreso(models.Model):
    nombre = models.CharField('Progreso Estudiante', max_length=150, null=False)
    descripcion = models.CharField('Avance Estudiante',max_length= 150, null=False)
    curso = models.ForeignKey(Curso,on_delete=models.CASCADE)
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.id) + '-' + self.nombre
        
class Solicitud_Estudiante(models.Model):
    nombre = models.CharField('Solicitud de Inscripcion del Curso', max_length=150, null=False)
    estado = models.BooleanField('Estado de la Solicitud', null =False)
    curso = models.ForeignKey(Curso,on_delete=models.CASCADE)
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    docente= models.ForeignKey(Docente, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.id) + '-' + self.nombre
        
class Categoria(models.Model):
    nombre = models.CharField('Categoria Clinica', max_length=150, null=False)
    descripcion = models.CharField('Descripción', max_length= 500 , null=False)

    def __str__(self):
        return str(self.id) + '-' + self.nombre
        
class Paciente_Ficticio(models.Model):
    nombre = models.CharField('Nombre del Paciente', max_length=150, null=False)
    descripcion = models.CharField('Descripción general del Paciente', max_length= 500, null=False)
    edad = models.IntegerField('Edad del Paciente', null=False)
    genero = models.CharField('Genero del Paciente', max_length=150, null=False)
    categoria = models.ForeignKey(Categoria, on_delete =models.CASCADE)

    def __str__(self):
        return str(self.id) + '-' + self.nombre

class Etapa(models.Model):
    nombre = models.CharField('Nombre Etapa', max_length=150, null=False)
    descripcion = models.CharField('Descripción', max_length= 500, null=False)
    video = models.URLField()
    paciente = models.ForeignKey(Paciente_Ficticio ,on_delete=models.CASCADE)


    def __str__(self):
        return str(self.id) + '-' + self.nombre

class Tema_Interrogacion(models.Model):
    nombre = models.CharField('Tema', max_length=150, null=False)
    pregunta = models.CharField('Preguntas', max_length=150, null=False)
    respuesta = models.CharField('Respuesta', null=False, max_length = 500)
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE)

    

    def __str__(self):
        return str(self.id) + '-' + self.nombre

class Parte_del_Cuerpo(models.Model):
    nombre = models.CharField('Parte del Cuerpo:', max_length=150, null=False)
    descripcion = models.CharField('descripcion', max_length=150, null=False)
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE)
    imagen = models.ImageField()

    def __str__(self):
        return str(self.id) + '-' + self.nombre

class Evaluacion(models.Model):
    nombre = models.CharField('Evaluacion', max_length=150, null=False)
    descripcion = models.CharField('descripcion', max_length=150, null=False)
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE)
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    paciente = models.ForeignKey(Paciente_Ficticio, on_delete=models.CASCADE)
    tema_interrogacion = models.ForeignKey(Tema_Interrogacion, on_delete=models.CASCADE)
    parte_del_cuerpo = models.ForeignKey(Parte_del_Cuerpo, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.id) + '-' + self.nombre

class Respuesta_Evaluacion(models.Model):
    nombre = models.CharField('Respuesta evaluación', max_length=150, null=False)
    descripcion = models.TextField('Detalle', null=False)
    retroalimentacion = models.TextField('Retroalimentación', null=False)
    correcta = models.BooleanField('Correcta o incorrecta', null= False)
    respuestas = models.TextField('Respuesta estudiante', null=False)
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE)
    evaluacion = models.ForeignKey(Evaluacion, on_delete=models.CASCADE)

    def _str_(self):
        return str(self.id) + '-' + self.nombre


class Envio_Docente(models.Model):
    nombre = models.CharField('Nombre de la evaluación:', max_length=150, null=False)
    descripcion = models.TextField('Descripción', null=False)
    nombreestudiante = models.TextField('Nombre estudiante:', null=False)
    fechaentrega = models.DateField('Fecha de entrega', null = False)
    docente = models.ForeignKey(Docente, on_delete=models.CASCADE)
    respuestaevaluacion = models.ForeignKey(Respuesta_Evaluacion, on_delete=models.CASCADE)


    def _str_(self):
        return str(self.id) + '-' + self.nombre
    
