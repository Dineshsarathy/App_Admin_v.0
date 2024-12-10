const express = require('express');
const router = express.Router();
const Template = require('../models/Template');  


// Route to get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to create a new template

router.post('/', async (req, res) => {
  const template = new Template({
    templateName: req.body.templateName,
    templateCategory: req.body.templateCategory,
    createdBy:req.body.createdBy,
    approvalStatus: req.body.approvalStatus,
});
try {
    const newTemp = await template.save();
    res.status(201).json(newTemp);
} catch (error) {
    res.status(400).json({message: error.message});
}
});


// Route to get a single template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!Template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.status(200).json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to update a template
router.put('/:id', async (req, res) => {
  try {
      // Find employee by ID
      const template = await Template.findById(req.params.id);

      // Check if the employee exists
      if (!Template) {
          return res.status(404).json({ message: "Employee not found!" });
      }

      // Update fields only if provided in req.body
      
      template.templateName = req.body.templateName || template.templateName;
      template.templateCategory = req.body.templateCategory || template.templateCategory;
      template.createdBy = req.body.createdBy || template.createdBy;
      template.approvalStatus = req.body.approvalStatus !== undefined ? req.body.approvalStatus : template.approvalStatus;
   
      // Set UpdatedAt field to current time
      template.CompletedDate = Date.now();

      // Save updated template to the database
      const Updatedtemp = await template.save();
     
      // Respond with the updated employee
      res.json(Updatedtemp);

  } catch (error) {
      // Handle any errors
      res.status(400).json({ message: error.message });
  }
});



// Route to delete a template
router.delete('/:id', async (req, res) => {
  try {
    const deletedTemplate = await Template.findByIdAndDelete(req.params.id);
    if (!deletedTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Catch-all route for handling non-existent routes
router.all('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = router;

