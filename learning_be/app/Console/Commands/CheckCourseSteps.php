<?php

namespace App\Console\Commands;

use App\Models\Course;
use Illuminate\Console\Command;

class CheckCourseSteps extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'courses:check-steps';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check course step counts to verify seeder data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Course Step Analysis');
        $this->info('===================');
        $this->newLine();

        $courses = Course::withCount('steps')->get();

        if ($courses->isEmpty()) {
            $this->error('No courses found in database.');
            return;
        }

        $minSteps = $courses->min('steps_count');
        $maxSteps = $courses->max('steps_count');
        $avgSteps = $courses->avg('steps_count');
        $coursesBelow20 = $courses->where('steps_count', '<', 20);

        $this->info("Summary:");
        $this->info("Total courses: " . $courses->count());
        $this->info("Min steps per course: $minSteps");
        $this->info("Max steps per course: $maxSteps");
        $this->info("Average steps per course: " . number_format($avgSteps, 2));
        $this->info("Courses with less than 20 steps: " . $coursesBelow20->count());
        $this->newLine();

        if ($coursesBelow20->count() > 0) {
            $this->error('Courses with less than 20 steps:');
            foreach ($coursesBelow20 as $course) {
                $this->line("- {$course->title}: {$course->steps_count} steps");
            }
            $this->newLine();
        } else {
            $this->info('✓ All courses have at least 20 steps!');
            $this->newLine();
        }

        $this->info('Sample courses with step counts:');
        $courses->take(10)->each(function($course) {
            $this->line("- {$course->title}: {$course->steps_count} steps");
        });

        return 0;
    }
}
