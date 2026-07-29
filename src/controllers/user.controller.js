const { User } = require('../models');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Opcional: Proteger para no auto-eliminarse
    if (user.email === 'dflorezo1996@gmail.com') {
      return res.status(403).json({ message: 'El superadministrador no puede ser eliminado' });
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando usuario', error: error.message });
  }
};

const bcrypt = require('bcryptjs');

const createUser = async (req, res) => {
  try {
    const { name, email, role, phone } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Los campos nombre, correo y rol son requeridos' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Ya existe un usuario registrado con este correo' });
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // El superadministrador no puede perder sus privilegios por accidente
    if (user.email === 'dflorezo1996@gmail.com' && role !== 'admin') {
      return res.status(403).json({ message: 'El superadministrador debe conservar el rol de admin' });
    }

    await user.update({
      name,
      email,
      role,
      phone
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, createUser, updateUser };
