# recommender.py
import pandas as pd
import numpy as np

class DynamicJobRecommender:
    def __init__(self, df, skill_cols, job_title_cols, location_cols):
        self.df = df
        self.skill_cols = skill_cols
        self.job_title_cols = job_title_cols
        self.location_cols = location_cols
        
        # Dynamically build skill mapping from dataset
        self.skill_mapping = self._build_dynamic_skill_mapping()
        print(f"Dynamic skill mapping: {len(self.skill_mapping)} skill groups")
        
        # Extract available skills for suggestions
        self.available_skills = self._extract_available_skills()
        print(f"Available skills in dataset: {len(self.available_skills)}")
        
        # Precompute metadata
        self._precompute_metadata()
    
    def _build_dynamic_skill_mapping(self):
        """Dynamically build skill mapping from actual data"""
        skill_mapping = {}
        
        # Group similar skills automatically
        for skill_col in self.skill_cols:
            skill_name = skill_col.replace('skill_', '').lower().strip('_ ')
            
            # Find base skill name (remove prefixes/suffixes)
            base_skill = self._extract_base_skill(skill_name)
            
            if base_skill not in skill_mapping:
                skill_mapping[base_skill] = []
            skill_mapping[base_skill].append(skill_col)
        
        return skill_mapping
    
    def _extract_base_skill(self, skill_name):
        """Extract base skill name from messy skill names"""
        # Common patterns in your dataset
        patterns_to_remove = ['_', 'skill', 'skills', 'experience', 'knowledge']
        
        base_skill = skill_name
        for pattern in patterns_to_remove:
            base_skill = base_skill.replace(pattern, ' ')
        
        # Clean up and get the main part
        base_skill = ' '.join(base_skill.split()).strip()
        
        # If empty, return original
        return base_skill if base_skill else skill_name
    
    def _extract_available_skills(self):
        """Extract most common skills from the dataset"""
        skill_frequency = {}
        
        for skill_col in self.skill_cols:
            # Count how many jobs have this skill
            count = self.df[self.df[skill_col] == 1].shape[0]
            if count > 0:
                skill_name = skill_col.replace('skill_', '').replace('_', ' ').title()
                skill_frequency[skill_name] = count
        
        # Return top skills by frequency
        return sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)[:50]
    
    def _precompute_metadata(self):
        """Precompute job titles and locations"""
        print("Precomputing metadata...")
        
        self.job_titles = []
        self.locations = []
        
        batch_size = 5000
        total_jobs = len(self.df)
        
        for i in range(0, total_jobs, batch_size):
            # Job titles
            batch_titles = self.df[self.job_title_cols].iloc[i:i+batch_size]
            for _, row in batch_titles.iterrows():
                title = "Unknown"
                for job_col in self.job_title_cols:
                    if row[job_col] == 1:
                        title = job_col.replace('Job Title_', '').replace('_', ' ')
                        break
                self.job_titles.append(title)
            
            # Locations
            batch_locations = self.df[self.location_cols].iloc[i:i+batch_size]
            for _, row in batch_locations.iterrows():
                location = "Unknown"
                for loc_col in self.location_cols:
                    if row[loc_col] == 1:
                        location = loc_col.replace('location_', '').replace('_', ' ')
                        break
                self.locations.append(location)
            
            progress = min(i + batch_size, total_jobs)
            if i % 20000 == 0:  # Print progress every 20k records
                print(f"  Progress: {progress}/{total_jobs} ({progress/total_jobs*100:.1f}%)")
    
    def find_skill_matches(self, user_skills):
        """Dynamically find skill matches using fuzzy matching"""
        matched_cols = []
        skill_details = {}
        
        for user_skill in user_skills:
            user_skill_lower = user_skill.lower()
            user_base_skill = self._extract_base_skill(user_skill_lower)
            
            # Find matches in skill mapping
            matches = []
            for base_skill, skill_columns in self.skill_mapping.items():
                if (user_base_skill in base_skill or 
                    base_skill in user_base_skill or 
                    self._skill_similarity(user_base_skill, base_skill) > 0.6):
                    matches.extend(skill_columns)
            
            # Also check direct column matches
            for skill_col in self.skill_cols:
                skill_name = skill_col.replace('skill_', '').lower()
                if (user_skill_lower in skill_name or 
                    skill_name in user_skill_lower or
                    self._skill_similarity(user_skill_lower, skill_name) > 0.7):
                    matches.append(skill_col)
            
            if matches:
                matched_cols.extend(matches)
                skill_details[user_skill] = {
                    'matched_columns': list(set(matches)),
                    'match_count': len(set(matches))
                }
        
        return list(set(matched_cols)), skill_details
    
    def _skill_similarity(self, skill1, skill2):
        """Simple skill similarity calculation"""
        words1 = set(skill1.split())
        words2 = set(skill2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0
    
    def get_recommendations(self, skills, experience_level=1.0, top_jobs=10, top_locations=5):
        """Main recommendation function"""
        matched_skill_cols, skill_details = self.find_skill_matches(skills)
        
        if not matched_skill_cols:
            # Suggest skills from the dataset
            suggestions = [skill[0] for skill in self.available_skills[:10]]
            return {
                'error': 'No matching skills found in the dataset',
                'suggestions': suggestions,
                'available_skills_count': len(self.available_skills)
            }
        
        print(f"Skill matching details:")
        for user_skill, details in skill_details.items():
            print(f"  '{user_skill}': {details['match_count']} matches")
        
        # Count-based matching
        skill_counts = self.df[matched_skill_cols].sum(axis=1)
        top_indices = skill_counts.nlargest(top_jobs).index
        
        job_recommendations = []
        for idx in top_indices:
            count = skill_counts[idx]
            if count > 0:
                job_data = {
                    'job_title': self.job_titles[idx],
                    'common_location': self.locations[idx],
                    'combined_score': float(count / len(matched_skill_cols)),
                    'skill_similarity': float(count / len(matched_skill_cols)),
                    'salary_min': int(self.df.iloc[idx]['salary_numeric'] * 0.8),
                    'salary_max': int(self.df.iloc[idx]['salary_numeric'] * 1.2),
                    'salary_midpoint': int(self.df.iloc[idx]['salary_numeric']),
                    'salary_range': self.df.iloc[idx]['Salary Range'],
                    'sample_size': 1,
                    'salary_confidence': 'Medium'
                }
                job_recommendations.append(job_data)
        
        # Location analysis
        location_scores = {}
        for job in job_recommendations:
            location = job['common_location']
            location_scores[location] = location_scores.get(location, 0) + job['combined_score']
        
        top_locations_list = sorted(location_scores.items(), key=lambda x: x[1], reverse=True)[:top_locations]
        location_recommendations = [{'location': loc, 'demand_score': float(score)} for loc, score in top_locations_list]
        
        # Salary analysis
        if job_recommendations:
            salaries = [job['salary_midpoint'] for job in job_recommendations]
            avg_salary = np.mean(salaries)
        else:
            salaries = [0]
            avg_salary = 0
        
        return {
            'success': True,
            'user_profile': {
                'skills_provided': skills,
                'experience_level': experience_level,
                'skills_matched': len(matched_skill_cols),
                'skill_details': skill_details
            },
            'salary_expectations': {
                'average_expected': int(avg_salary),
                'range': f"${int(min(salaries)):,} - ${int(max(salaries)):,}",
                'confidence': 'High' if len(job_recommendations) > 5 else 'Medium'
            },
            'job_recommendations': job_recommendations,
            'location_recommendations': location_recommendations,
            'best_overall': {
                'job': job_recommendations[0]['job_title'] if job_recommendations else 'Unknown',
                'location': location_recommendations[0]['location'] if location_recommendations else 'Unknown',
                'expected_salary': job_recommendations[0]['salary_midpoint'] if job_recommendations else 0,
                'salary_range': job_recommendations[0]['salary_range'] if job_recommendations else '$0-$0',
                'confidence': job_recommendations[0]['combined_score'] if job_recommendations else 0
            },
            'dataset_info': {
                'total_jobs': len(self.df),
                'total_skills': len(self.skill_cols),
                'available_skills_sample': [skill[0] for skill in self.available_skills[:10]]
            }
        }