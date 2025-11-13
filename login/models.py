from django.db import models

# Create your models here.
class Docentes(models.Model):
    nombre = models.CharField('Nombre del Docente', max_length=150, null=False)
    apellido = models.CharField('Apellido del Docente', max_length=150, null=False)
    correo = models.EmailField('Correo del Docente', max_length=150, null=False, unique= True)
    contrasena = models.CharField('Contraseña del Docente', max_length=150, null=False)
    
    def __str__(self):
        return str(self.id) + '-' + self.nombre
    
    
class Estudiante(models.Model):
    nombre = models.CharField('Nombre del Estudiante', max_length=150, null=False)
    apellido = models.CharField('Apellido del Estudiante', max_length=150, null=False)
    correo = models.EmailField('Correo del Estudiante', max_length=150, null=False, unique= True)
    contrasena = models.CharField('Contraseña del Estudiante', max_length=150, null=False)
    
    def __str__(self):
        return str(self.id) + '-' + self.nombre
