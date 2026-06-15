export class WAMessageBuilder {
  static buildTimetableMessage(entries: any[], session: string): string {
    let message = `*📅 ExamSync Timetable - ${session}*\n\n`;

    entries.forEach((entry) => {
      const typeIcon = entry.examType === 'CBT' ? '🖥️' : '📝';
      message += `*${entry.courseCode}: ${entry.courseTitle}*\n`;
      message += `${typeIcon} Type: ${entry.examType}\n`;
      message += `📅 Date: ${entry.date}\n`;
      message += `⏰ Time: ${entry.time}\n`;
      message += `📍 Venue: ${entry.venue}\n`;
      message += `-------------------\n`;
    });

    message += `\n_Generated via ExamSync AI_`;
    return message;
  }
}
