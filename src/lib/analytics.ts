import { AnalyticsEvent } from "@/types/consult";

const events: AnalyticsEvent[] = [];

export function trackEvent(event: AnalyticsEvent): void {
  events.push(event);
  console.log("[Analytics]", JSON.stringify(event));
}

export function getEvents(): AnalyticsEvent[] {
  return [...events];
}
