import pool from './connect.js';

/**
 * Demonstrates database operations against the aligned schema.
 */
async function runTests() {
  try {
    console.log('\n========== TEST QUERIES ==========\n');

    console.log('1. Testing Database Connectivity...');
    const connectResult = await pool.query(
      'SELECT NOW() as current_time, version() as db_version',
    );
    console.log('Connected! Current time:', connectResult.rows[0].current_time);
    console.log('Database version:', connectResult.rows[0].db_version.split(',')[0]);

    console.log('\n2. Fetching All Users...');
    const usersResult = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users',
    );
    console.log(`Found ${usersResult.rows.length} user(s):`);
    usersResult.rows.forEach((user) => {
      console.log(
        `- ${user.full_name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`,
      );
    });

    console.log('\n3. Fetching All Exams...');
    const examsResult = await pool.query(
      'SELECT id, title, duration_minutes, status, passing_grade, created_at FROM exams',
    );
    console.log(`Found ${examsResult.rows.length} exam(s):`);
    examsResult.rows.forEach((exam) => {
      console.log(
        `- "${exam.title}" (${exam.duration_minutes} min, ${exam.status}, Pass: ${exam.passing_grade}%) - ID: ${exam.id}`,
      );
    });

    console.log('\n4. Fetching One Exam with Questions...');
    const oneExamResult = await pool.query(
      `SELECT e.*, u.full_name AS teacher_name
       FROM exams e
       JOIN users u ON u.id = e.teacher_id
       LIMIT 1`,
    );

    if (oneExamResult.rows.length > 0) {
      const exam = oneExamResult.rows[0];
      console.log('Exam Found:');
      console.log(`Title: ${exam.title}`);
      console.log(`Teacher: ${exam.teacher_name}`);
      console.log(`Duration: ${exam.duration_minutes} minutes`);
      console.log(`Status: ${exam.status}`);
      console.log(`Passing Grade: ${exam.passing_grade}%`);

      const questionsResult = await pool.query(
        `SELECT id, type, text, options, correct_option_id, points, sort_order
         FROM questions
         WHERE exam_id = $1
         ORDER BY sort_order`,
        [exam.id],
      );

      console.log(`\n5. Questions for "${exam.title}":`);
      console.log(`Found ${questionsResult.rows.length} question(s):`);
      questionsResult.rows.forEach((question, index) => {
        console.log(`\nQuestion ${index + 1}:`);
        console.log(`ID: ${question.id}`);
        console.log(`Type: ${question.type}`);
        console.log(`Text: ${question.text}`);
        console.log(`Points: ${question.points}`);

        if (Array.isArray(question.options) && question.options.length > 0) {
          console.log(
            `Options: ${question.options.map((option) => option.text).join(', ')}`,
          );
        }

        if (question.correct_option_id) {
          console.log(`Correct Option ID: ${question.correct_option_id}`);
        }
      });
    } else {
      console.log('No exams found in the database.');
    }

    console.log('\n6. Exam Submissions with User Information...');
    const submissionsResult = await pool.query(`
      SELECT
        s.id AS submission_id,
        s.score,
        s.max_score,
        s.percentage,
        s.status,
        s.submitted_at,
        e.title AS exam_title,
        u.full_name AS student_name,
        u.email AS student_email,
        jsonb_array_length(s.answers) AS answer_count
      FROM submissions s
      JOIN exams e ON s.exam_id = e.id
      JOIN users u ON s.student_id = u.id
      ORDER BY s.submitted_at DESC
    `);

    if (submissionsResult.rows.length > 0) {
      console.log(`Found ${submissionsResult.rows.length} submission(s):`);
      submissionsResult.rows.forEach((submission) => {
        console.log(`
Student: ${submission.student_name} (${submission.student_email})
Exam: ${submission.exam_title}
Score: ${submission.score}/${submission.max_score} (${submission.percentage}%)
Status: ${submission.status}
Answers Provided: ${submission.answer_count}
Submitted: ${submission.submitted_at}`);
      });
    } else {
      console.log('No submissions found in the database.');
    }

    console.log('\n========== ALL TESTS COMPLETED ==========\n');
  } catch (error) {
    console.error('Error during tests:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runTests();
