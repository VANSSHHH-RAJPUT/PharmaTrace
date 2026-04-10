const Actor = require('../models/Actor');

exports.createActor = async (req, res) => {
  try {
    const { wallet, name, role } = req.body;
    
    let actor = await Actor.findOne({ wallet });
    if (actor) {
      actor.name = name;
      actor.role = role;
      await actor.save();
      return res.json(actor);
    }

    actor = new Actor({ wallet, name, role });
    await actor.save();
    res.status(201).json(actor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getActor = async (req, res) => {
  try {
    const { wallet } = req.params;
    const actor = await Actor.findOne({ wallet });
    if (!actor) return res.status(404).json({ error: 'Actor not found' });
    res.json(actor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};