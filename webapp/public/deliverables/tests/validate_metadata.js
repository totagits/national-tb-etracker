const fs = require('fs');
const path = require('path');

const METADATA_PATH = path.join(__dirname, '../metadata/dhis2_metadata_package.json');

function validateMetadata() {
  console.log('--- DHIS2 Metadata Validation Test ---');
  
  if (!fs.existsSync(METADATA_PATH)) {
    console.error('❌ Error: dhis2_metadata_package.json not found!');
    process.exit(1);
  }

  let metadata;
  try {
    const rawData = fs.readFileSync(METADATA_PATH, 'utf8');
    metadata = JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Error parsing JSON:', error.message);
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  // Validate Tracked Entity Types
  if (!metadata.trackedEntityTypes || metadata.trackedEntityTypes.length === 0) {
    errors.push('Missing Tracked Entity Types. The system needs at least one TET (e.g., TB Patient).');
  } else {
    console.log('✅ Tracked Entity Types found:', metadata.trackedEntityTypes.length);
  }

  // Validate Attributes
  if (!metadata.trackedEntityAttributes || metadata.trackedEntityAttributes.length === 0) {
    errors.push('Missing Tracked Entity Attributes.');
  } else {
    console.log('✅ Tracked Entity Attributes found:', metadata.trackedEntityAttributes.length);
    const uniqueIds = metadata.trackedEntityAttributes.filter(a => a.generated);
    if (uniqueIds.length === 0) {
      warnings.push('No auto-generated attributes found. Recommended for TB Tracker ID.');
    }
  }

  // Validate Programs
  if (!metadata.programs || metadata.programs.length === 0) {
    errors.push('Missing Programs configuration.');
  } else {
    const tbProgram = metadata.programs[0];
    console.log(`✅ Program found: ${tbProgram.name} (${tbProgram.id})`);
    
    if (tbProgram.programType !== 'WITH_REGISTRATION') {
      errors.push(`Program ${tbProgram.name} must be WITH_REGISTRATION for a longitudinal tracker.`);
    }

    // Validate Program Stages
    if (!tbProgram.programStages || tbProgram.programStages.length === 0) {
      errors.push(`Program ${tbProgram.name} has no Program Stages.`);
    } else {
      console.log(`✅ Program Stages found: ${tbProgram.programStages.length}`);
      const expectedStages = ['Screening', 'Diagnosis', 'Treatment', 'Outcome'];
      const stageNames = tbProgram.programStages.map(s => s.name);
      
      expectedStages.forEach(stage => {
        if (!stageNames.some(s => s.includes(stage))) {
          warnings.push(`Recommended program stage missing: ${stage}`);
        }
      });
      
      const repeatableStages = tbProgram.programStages.filter(s => s.repeatable);
      if (repeatableStages.length === 0) {
        warnings.push('No repeatable stages found. Consider making Follow-up Monitoring repeatable.');
      } else {
        console.log(`✅ Repeatable Stages correctly identified: ${repeatableStages.map(s => s.name).join(', ')}`);
      }
    }
  }

  console.log('\n--- Validation Results ---');
  if (errors.length > 0) {
    console.error('❌ Validation Failed with the following errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log('✅ Validation Passed: No critical structural errors.');
    if (warnings.length > 0) {
      console.warn('⚠️ Warnings:');
      warnings.forEach(w => console.warn(`  - ${w}`));
    }
    process.exit(0);
  }
}

validateMetadata();
