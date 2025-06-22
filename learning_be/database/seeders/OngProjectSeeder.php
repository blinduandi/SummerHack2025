<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\OngProject;
use App\Models\OngProjectApplication;
use Faker\Factory as Faker;
use Carbon\Carbon;

class OngProjectSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Create ONG users if they don't exist
        $ongUsers = $this->createOngUsers($faker);
        
        // Create student users if they don't exist
        $studentUsers = $this->createStudentUsers($faker);

        // Project categories and types
        $projectCategories = [
            'Environmental' => [
                'Clean Water Initiative',
                'Waste Management System',
                'Carbon Footprint Tracker',
                'Renewable Energy Monitor',
                'Wildlife Conservation App',
                'Sustainable Living Platform'
            ],
            'Education' => [
                'Learning Management System',
                'Educational Game Platform',
                'Digital Library System',
                'Student Progress Tracker',
                'Online Tutoring Platform',
                'Educational Content Creator'
            ],
            'Healthcare' => [
                'Medical Records System',
                'Telemedicine Platform',
                'Health Monitoring App',
                'Vaccination Tracker',
                'Mental Health Support App',
                'Emergency Response System'
            ],
            'Social Impact' => [
                'Community Support Network',
                'Volunteer Management System',
                'Disaster Relief Coordinator',
                'Food Bank Management',
                'Homeless Shelter System',
                'Senior Care Platform'
            ],
            'Technology' => [
                'AI-Powered Chatbot',
                'Data Analytics Dashboard',
                'Mobile App Development',
                'Web Platform Creation',
                'IoT Solution Development',
                'Blockchain Implementation'
            ]
        ];

        $skillsSets = [
            'Web Development' => ['HTML', 'CSS', 'JavaScript', 'PHP', 'Laravel', 'Vue.js', 'React'],
            'Mobile Development' => ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic'],
            'Data Science' => ['Python', 'R', 'Machine Learning', 'Data Analysis', 'Pandas', 'NumPy'],
            'DevOps' => ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Jenkins', 'Terraform'],
            'Design' => ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
            'Backend' => ['Node.js', 'Python', 'Java', 'C#', 'Database Design', 'API Development']
        ];

        // Create 25 ONG projects with different statuses and scenarios
        foreach ($ongUsers as $ong) {
            $projectsCount = rand(2, 5); // Each ONG creates 2-5 projects
            
            for ($i = 0; $i < $projectsCount; $i++) {
                $category = $faker->randomElement(array_keys($projectCategories));
                $projectTitle = $faker->randomElement($projectCategories[$category]);
                $skillCategory = $faker->randomElement(array_keys($skillsSets));
                $requiredSkills = $faker->randomElements($skillsSets[$skillCategory], min(rand(3, 5), count($skillsSets[$skillCategory])));
                
                // Determine project status and dates
                $status = $faker->randomElement(['open', 'closed']);
                $createdAt = $faker->dateTimeBetween('-3 months', 'now');
                $dueDate = $faker->dateTimeBetween('now', '+2 months');
                
                // Adjust due date based on status
                if ($status === 'closed') {
                    $dueDate = $faker->dateTimeBetween($createdAt, 'now');
                }

                $project = OngProject::create([
                    'ong_id' => $ong['id'],
                    'title' => $projectTitle . ' - ' . $category,
                    'description' => $this->generateProjectDescription($projectTitle, $category, $faker),
                    'requirements' => $this->generateProjectRequirements($requiredSkills, $faker),
                    'skills_needed' => $requiredSkills,
                    'due_date' => $dueDate,
                    'status' => $status,
                    'winner_user_id' => null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                // Create applications based on project status
                $this->createProjectApplications($project, $studentUsers, $status, $faker);
            }
        }

        $this->command->info('ONG Projects seeded successfully!');
        $this->command->info('Created projects by ' . count($ongUsers) . ' ONG organizations');
        $this->command->info('Total projects: ' . OngProject::count());
        $this->command->info('Total applications: ' . OngProjectApplication::count());
    }

    private function createOngUsers($faker): array
    {
        $ongUsers = User::where('role', 'ong')->get();
        
        if ($ongUsers->count() < 5) {
            // Create additional ONG users
            $ongOrganizations = [
                'Green Earth Foundation',
                'Education for All',
                'Health Connect NGO',
                'Community Care Initiative',
                'Tech for Good',
                'Youth Empowerment Organization',
                'Clean Energy Alliance',
                'Digital Literacy Foundation'
            ];

            for ($i = $ongUsers->count(); $i < 8; $i++) {
                $orgName = $ongOrganizations[$i] ?? $faker->company . ' Foundation';
                
                $newUser = User::create([
                    'name' => $orgName,
                    'email' => strtolower(str_replace(' ', '', $orgName)) . '@ong.org',
                    'email_verified_at' => now(),
                    'password' => bcrypt('password123'),
                    'role' => 'ong',
                    'avatar' => $faker->imageUrl(200, 200, 'business'),
                ]);
                $ongUsers->push($newUser);
            }
        }

        return $ongUsers->toArray();
    }

    private function createStudentUsers($faker): array
    {
        $studentUsers = User::where('role', 'student')->get();
        
        if ($studentUsers->count() < 15) {
            // Create additional student users
            for ($i = $studentUsers->count(); $i < 20; $i++) {
                $firstName = $faker->firstName;
                $lastName = $faker->lastName;
                
                $newUser = User::create([
                    'name' => $firstName . ' ' . $lastName,
                    'email' => strtolower($firstName . '.' . $lastName) . '@student.com',
                    'email_verified_at' => now(),
                    'password' => bcrypt('password123'),
                    'role' => 'student',
                    'avatar' => $faker->imageUrl(200, 200, 'people'),
                ]);
                $studentUsers->push($newUser);
            }
        }

        return $studentUsers->toArray();
    }

    private function generateProjectDescription($title, $category, $faker): string
    {
        $descriptions = [
            'Environmental' => "We are seeking talented developers to create a comprehensive {$title} solution that will help our organization track and reduce environmental impact. This project aims to make a real difference in sustainability efforts.",
            'Education' => "Our educational initiative requires a modern {$title} platform to serve underserved communities. We need passionate developers who believe in the power of education to transform lives.",
            'Healthcare' => "This {$title} project will directly impact patient care and healthcare accessibility. We're looking for developers who want to contribute to improving healthcare outcomes.",
            'Social Impact' => "Join us in building a {$title} that will strengthen community bonds and provide essential services to those in need. This is an opportunity to create meaningful social change.",
            'Technology' => "We need innovative developers to build a cutting-edge {$title} solution that will serve as a foundation for our digital transformation initiatives."
        ];

        $baseDescription = $descriptions[$category] ?? $faker->paragraph(3);
        
        return $baseDescription . "\n\n" . $faker->paragraph(2) . "\n\nThis is a volunteer opportunity that offers valuable real-world experience and the chance to make a positive impact in the community.";
    }

    private function generateProjectRequirements($skills, $faker): string
    {
        $requirements = "We are looking for developers with the following qualifications:\n\n";
        $requirements .= "Technical Skills:\n";
        
        foreach ($skills as $skill) {
            $requirements .= "- Proficiency in {$skill}\n";
        }
        
        $requirements .= "\nGeneral Requirements:\n";
        $requirements .= "- Strong problem-solving abilities\n";
        $requirements .= "- Good communication skills\n";
        $requirements .= "- Ability to work in a team environment\n";
        $requirements .= "- Commitment to project timeline\n";
        $requirements .= "- Previous experience in similar projects (preferred)\n";
        
        return $requirements;
    }

    private function createProjectApplications($project, $studentUsers, $status, $faker): void
    {
        $applicationCount = 0;
        
        // Determine number of applications based on status
        switch ($status) {
            case 'open':
                $applicationCount = rand(2, 8);
                break;
            case 'closed':
                $applicationCount = rand(5, 15);
                break;
        }

        $selectedStudents = $faker->randomElements($studentUsers, min($applicationCount, count($studentUsers)));
        $winner = null;

        foreach ($selectedStudents as $index => $student) {
            $applicationStatus = 'applied';
            $githubRepo = null;
            $images = null;
            
            // Determine application status based on project status
            if ($status === 'closed') {
                if ($index === 0 && !$winner) {
                    $applicationStatus = 'accepted';
                    $winner = $student;
                    $project->update(['winner_user_id' => $student['id']]);
                } else {
                    $applicationStatus = $faker->randomElement(['rejected', 'completed']);
                }
            } else {
                // For open projects, all applications are 'applied'
                $applicationStatus = 'applied';
            }

            // Add GitHub repo and images for completed applications
            if ($applicationStatus === 'completed' || $applicationStatus === 'accepted') {
                $githubRepo = 'https://github.com/' . strtolower(str_replace(' ', '', $student['name'])) . '/' . strtolower(str_replace([' ', '-'], '', $project->title));
                $images = [
                    $faker->imageUrl(800, 600, 'technics'),
                    $faker->imageUrl(800, 600, 'business'),
                    $faker->imageUrl(800, 600, 'abstract')
                ];
            }

            OngProjectApplication::create([
                'project_id' => $project->id,
                'user_id' => $student['id'],
                'status' => $applicationStatus,
                'github_repo' => $githubRepo,
                'images' => $images,
                'feedback' => $applicationStatus === 'rejected' ? $faker->sentence(10) : null,
                'created_at' => $faker->dateTimeBetween($project->created_at, 'now'),
                'updated_at' => now(),
            ]);
        }
    }
}
