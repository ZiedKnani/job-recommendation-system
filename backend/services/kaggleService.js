import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class KaggleService {
  static getDataset() {
    try {
      console.log('📁 Chargement des données PROCESSED...');
      // Utiliser le fichier processed qui est plus petit
      const data = readFileSync(join(__dirname, '..', 'ml-core', 'processed_job_data_sample.csv'), 'utf8');
      console.log('✅ Données processed chargées');
      return data;
    } catch (error) {
      console.log('❌ Erreur chargement processed:', error.message);
      return this.getSampleData();
    }
  }

  static getSampleData() {
    return `Job Id,Job Title,Role,Company,Qualifications,Experience,Job Description,skills,location,Country
1,Software Engineer,Software Developer,Tech Corp,Bachelor CS,2-5 years,Develop applications,Python JavaScript,Paris,France
2,Data Scientist,Data Analyst,Data Inc,Master DS,3-6 years,Analyze data,Python SQL ML,London,UK`;
  }
}

export default KaggleService;