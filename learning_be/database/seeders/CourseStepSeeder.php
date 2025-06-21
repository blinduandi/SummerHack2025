<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseStepSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample course steps for demonstration
        // Note: This assumes you have at least one course with ID 1
        $steps = [
            [
                'course_id' => 1,
                'title' => 'Introduction to Variables',
                'description' => 'Learn about variables and data types',
                'content' => '
                    <div class="step-content">
                        <h2>Variables in Programming</h2>
                        <p>Variables are containers for storing data values. In most programming languages, you need to declare variables before using them.</p>

                        <h3>Example:</h3>
                        <pre><code class="language-javascript">
let name = "John";
let age = 25;
let isStudent = true;
                        </code></pre>

                        <div class="info-box">
                            <p><strong>Remember:</strong> Variable names should be descriptive and follow naming conventions.</p>
                        </div>

                        <h3>Video Tutorial</h3>
                        <div class="video-container">
                            <iframe src="https://example.com/video/variables" width="560" height="315"></iframe>
                        </div>
                    </div>
                ',
                'step_order' => 1,
                'step_type' => 'lesson',
                'is_required' => true,
                'metadata' => json_encode([
                    'estimated_duration' => 15, // minutes
                    'difficulty' => 'beginner',
                    'has_video' => true,
                    'video_duration' => 8 // minutes
                ]),
                'is_active' => true,
            ],
            [
                'course_id' => 1,
                'title' => 'Practice: Create Variables',
                'description' => 'Practice creating and using variables',
                'content' => '
                    <div class="step-content">
                        <h2>Exercise: Variable Practice</h2>
                        <p>Complete the following exercises to practice working with variables:</p>

                        <div class="exercise">
                            <h3>Task 1:</h3>
                            <p>Create a variable called <code>firstName</code> and assign it your first name.</p>

                            <div class="code-editor">
                                <textarea placeholder="Write your code here..."></textarea>
                            </div>
                        </div>

                        <div class="exercise">
                            <h3>Task 2:</h3>
                            <p>Create variables for age, city, and favorite color.</p>

                            <div class="code-editor">
                                <textarea placeholder="Write your code here..."></textarea>
                            </div>
                        </div>

                        <div class="terminal-commands">
                            <h3>Test Your Code:</h3>
                            <p>Run the following command to test your solution:</p>
                            <pre><code>node variables.js</code></pre>
                        </div>
                    </div>
                ',
                'step_order' => 2,
                'step_type' => 'exercise',
                'is_required' => true,
                'metadata' => json_encode([
                    'estimated_duration' => 20, // minutes
                    'difficulty' => 'beginner',
                    'max_attempts' => 3,
                    'passing_score' => 70
                ]),
                'is_active' => true,
            ],
            [
                'course_id' => 1,
                'title' => 'Knowledge Check: Variables',
                'description' => 'Test your understanding of variables',
                'content' => '
                    <div class="step-content">
                        <h2>Quiz: Variables and Data Types</h2>

                        <div class="question">
                            <h3>Question 1:</h3>
                            <p>Which of the following is a valid variable name in JavaScript?</p>
                            <div class="options">
                                <label><input type="radio" name="q1" value="a"> 2name</label>
                                <label><input type="radio" name="q1" value="b"> user-age</label>
                                <label><input type="radio" name="q1" value="c"> firstName</label>
                                <label><input type="radio" name="q1" value="d"> var</label>
                            </div>
                        </div>

                        <div class="question">
                            <h3>Question 2:</h3>
                            <p>What will be the output of: <code>console.log(typeof 42);</code></p>
                            <div class="options">
                                <label><input type="radio" name="q2" value="a"> "string"</label>
                                <label><input type="radio" name="q2" value="b"> "number"</label>
                                <label><input type="radio" name="q2" value="c"> "boolean"</label>
                                <label><input type="radio" name="q2" value="d"> "undefined"</label>
                            </div>
                        </div>

                        <button class="submit-quiz">Submit Quiz</button>
                    </div>
                ',
                'step_order' => 3,
                'step_type' => 'quiz',
                'is_required' => true,
                'metadata' => json_encode([
                    'estimated_duration' => 10, // minutes
                    'difficulty' => 'beginner',
                    'total_questions' => 2,
                    'passing_score' => 80,
                    'answers' => [
                        'q1' => 'c',
                        'q2' => 'b'
                    ]
                ]),
                'is_active' => true,
            ]
        ];

        foreach ($steps as $step) {
            DB::table('course_steps')->insert(array_merge($step, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
