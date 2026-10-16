with open('src/app/admin/calendar/page.tsx', 'r') as f:
    lines = f.readlines()

# Find the start and end of the daysInMonth.map block in the MonthView function.
start_index = None
for i, line in enumerate(lines):
    if line.strip() == '{daysInMonth.map((day, index) => {':
        start_index = i
        break

if start_index is not None:
    # Now find the end of the map function: we look for the line that has exactly '        )}' (with 8 spaces) after the start.
    end_index = None
    for i in range(start_index, len(lines)):
        if lines[i].rstrip() == '        )}':
            end_index = i
            break

    if end_index is not None:
        # Now we have the block from start_index to end_index (inclusive) that we want to replace.
        # We'll replace it with the new block.

        new_block = '''        {daysInMonth.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isTodayDay = isToday(day);
          const isCurrentMonthDay = isCurrentMonth(day);

          return (
            <div
              key={index}
              className={`relative h-24 min-w-0 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900 ${
                isTodayDay
                  ? 'border-2 border-purple-600'
                  : isCurrentMonthDay
                    ? 'bg-white dark:bg-zinc-950'
                    : 'bg-slate-50 dark:bg-zinc-900/50'
              }`}
            >
              <div className="flex justify-between items-start p-2">
                <span className={`text-[10px] font-sans ${isTodayDay ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>
                  {format(day, 'd')}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  {dayEvents.length}
                </span>
              </div>

              <div className="mt-1 space-y-1 h-[calc(100%-2rem)] overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`truncate rounded-sm px-1 py-0.5 text-[9px] font-medium ${
                      event.isTentative
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-slate-400 dark:text-zinc-500">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}'''

        # We must ensure that the new block has the same indentation as the old block.
        # The old block started at 8 spaces (we assume) and the new block is written with 8 spaces at the beginning of each line.
        # But note: the new block string we wrote above has 8 spaces at the beginning of each line? Let's check:

        # The first line of new_block is:        {daysInMonth.map((day, index) => {
        # That is 8 spaces.

        # We'll split the new_block into lines and then replace the old block lines with these lines.

        new_block_lines = new_block.split('\n')
        # We need to add a newline at the end of each line if not present.
        new_block_lines = [line + '\n' for line in new_block_lines]

        # Replace the old block with the new block.
        lines = lines[:start_index] + new_block_lines + lines[end_index+1:]

with open('src/app/admin/calendar/page.tsx', 'w') as f:
    f.writelines(lines)
