import sys

with open('src/app/admin/calendar/page.tsx', 'r') as f:
    lines = f.readlines()

# Find the start and end of the daysOfMonth map block
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if line.strip() == '{daysInMonth.map((day, index) => {':
        start_idx = i
        break

if start_idx is not None:
    # Find the matching closing brace for the map call
    # We'll look for the line that has exactly '        )}' (with 8 spaces) after the start
    for i in range(start_idx, len(lines)):
        if lines[i].rstrip() == '        )}':
            end_idx = i
            break

if start_idx is not None and end_idx is not None:
    # Replace the block
    new_block = '''        {daysInMonth.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isTodayDay = isToday(day);
          const isCurrentMonthDay = isCurrentMonth(day);

          return (
            <div
              key={index}
              className={`group relative h-24 min-w-0 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900 ${
                isTodayDay
                  ? 'border-2 border-primary'
                  : isCurrentMonthDay
                    ? 'bg-white dark:bg-zinc-950'
                    : 'bg-slate-50 dark:bg-zinc-900/50'
              }`}
            >
              <div className="flex justify-between items-start p-2">
                <span className={`text-[10px] font-sans ${isTodayDay ? 'text-primary font-bold' : 'text-slate-400'}`}>
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
                        ? 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary'
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
    # Ensure the new block ends with a newline
    new_block_lines = [line + '\n' if not line.endswith('\n') else line for line in new_block.split('\n')]
    # Replace the old block with the new one
    lines = lines[:start_idx] + new_block_lines + lines[end_idx+1:]

with open('src/app/admin/calendar/page.tsx', 'w') as f:
    f.writelines(lines)
