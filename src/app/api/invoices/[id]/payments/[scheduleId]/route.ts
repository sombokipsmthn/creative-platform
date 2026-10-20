import { withCreatorApi } from "@/lib/api/route-boundaries";
import { deleteSchedule, saveSchedule } from "@/lib/services/payments";

type RouteContext = { params: Promise<{ id: string; scheduleId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withCreatorApi(request, async (request, user) => {
    const { id, scheduleId } = await context.params;
    return saveSchedule(user.id, id, await request.json(), scheduleId);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return withCreatorApi(request, async (_request, user) => {
    const { id, scheduleId } = await context.params;
    return deleteSchedule(user.id, id, scheduleId);
  });
}
