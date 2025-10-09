"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useUpdateFollowup } from "@/hooks/useCandidate";
import { CallStatus, OverallStatus } from "@/types/candidateTypes";
import { toast } from "sonner";

const followupSchema = z.object({
  callStatus: z.nativeEnum(CallStatus),
  notes: z.string().optional(),
});

type FollowupFormValues = z.infer<typeof followupSchema>;

interface AddFollowupFormProps {
  candidateId: string;
  attemptNumber: number;
  maxAttempts: number;
  attemptedBy: string;
  candidateStatus?: OverallStatus;
  onSuccess?: () => void;
}

// Generate time slots from 9 AM to 6 PM
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 18) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function AddFollowupForm({
  candidateId,
  attemptNumber,
  maxAttempts,
  attemptedBy,
  candidateStatus,
  onSuccess,
}: AddFollowupFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const updateFollowupMutation = useUpdateFollowup();

  const form = useForm<FollowupFormValues>({
    resolver: zodResolver(followupSchema),
    defaultValues: {
      notes: "",
    },
  });

  const callStatus = form.watch("callStatus");
  const showAppointmentPicker = callStatus === CallStatus.ANSWERED_AGREED;

  // Disable if candidate is dropped or max attempts reached
  const isDropped = candidateStatus === OverallStatus.DROPPED;
  const isDisabled = attemptNumber > maxAttempts;

  const onSubmit = async (values: FollowupFormValues) => {
    console.log("🔵 Form submitted with values:", values);
    console.log("🔵 Selected date:", selectedDate);
    console.log("🔵 Selected time:", selectedTime);
    console.log("🔵 Show appointment picker:", showAppointmentPicker);

    // Manual validation: If ANSWERED_AGREED, require date and time
    if (
      values.callStatus === CallStatus.ANSWERED_AGREED &&
      (!selectedDate || !selectedTime)
    ) {
      toast.error(
        "Please select interview date and time when candidate agrees to interview"
      );
      return;
    }

    try {
      // Combine date and time if both selected
      let scheduledInterviewDate: string | undefined;
      if (selectedDate && selectedTime && showAppointmentPicker) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const combinedDateTime = new Date(selectedDate);
        combinedDateTime.setHours(hours, minutes, 0, 0);
        scheduledInterviewDate = combinedDateTime.toISOString();
      }

      const payload = {
        candidateId,
        attemptNumber,
        callStatus: values.callStatus,
        notes: values.notes,
        scheduledInterviewDate,
        attemptedBy,
      };

      console.log("🔵 API Payload:", payload);

      await updateFollowupMutation.mutateAsync(payload);

      console.log("✅ Follow-up added successfully");

      // Show success message based on call status
      if (values.callStatus === CallStatus.ANSWERED_AGREED) {
        toast.success(
          "Follow-up added! Interview scheduled and status updated to SCHEDULED."
        );
      } else if (
        values.callStatus === CallStatus.ANSWERED_DECLINED ||
        values.callStatus === CallStatus.WRONG_NUMBER
      ) {
        toast.success("Follow-up added. Candidate marked as DROPPED.");
      } else if (attemptNumber === 1) {
        toast.success("Follow-up added. Status updated to ATTEMPTING.");
      } else {
        toast.success("Follow-up attempt added successfully.");
      }

      // Reset form
      form.reset();
      setSelectedDate(undefined);
      setSelectedTime(null);
      setIsFormOpen(false);

      onSuccess?.();
    } catch (error: any) {
      console.error("❌ Error adding follow-up:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to add follow-up attempt"
      );
    }
  };

  if (isDropped || isDisabled) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>
            {isDropped
              ? "This candidate has been dropped. No further follow-ups allowed."
              : `Maximum follow-up attempts (${maxAttempts}) reached`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Add Follow-up Attempt #{attemptNumber}</CardTitle>
            <CardDescription>
              {attemptNumber - 1} of {maxAttempts} attempts used
              {attemptNumber === maxAttempts && (
                <span className="block text-amber-600 mt-1">
                  Final attempt - will auto-drop if not ANSWERED_AGREED
                </span>
              )}
            </CardDescription>
          </div>
          {!isFormOpen && (
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Attempt
            </Button>
          )}
        </div>
      </CardHeader>

      {isFormOpen && (
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Call Status */}
              <FormField
                control={form.control}
                name="callStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select call status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CallStatus.ANSWERED_AGREED}>
                          Answered - Agreed
                        </SelectItem>
                        <SelectItem value={CallStatus.ANSWERED_DECLINED}>
                          Answered - Declined
                        </SelectItem>
                        <SelectItem value={CallStatus.NOT_ANSWERING}>
                          Not Answering
                        </SelectItem>
                        <SelectItem value={CallStatus.WRONG_NUMBER}>
                          Wrong Number
                        </SelectItem>
                        <SelectItem value={CallStatus.SWITCHED_OFF}>
                          Switched Off
                        </SelectItem>
                        <SelectItem value={CallStatus.BUSY}>Busy</SelectItem>
                        <SelectItem value={CallStatus.CALLBACK_REQUESTED}>
                          Callback Requested
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this follow-up attempt..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Appointment Picker - Only show if ANSWERED_AGREED */}
              {showAppointmentPicker && (
                <div className="space-y-2">
                  <FormLabel>Schedule Interview Date & Time *</FormLabel>
                  <div className="rounded-md border">
                    <div className="flex max-sm:flex-col">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                        className="p-2 sm:pe-5"
                        disabled={[{ before: new Date() }]}
                      />
                      <div className="relative w-full max-sm:h-48 sm:w-40">
                        <div className="absolute inset-0 py-4 max-sm:border-t">
                          <ScrollArea className="h-full sm:border-s">
                            <div className="space-y-3">
                              <div className="flex h-5 shrink-0 items-center px-5">
                                <p className="text-sm font-medium">
                                  {selectedDate
                                    ? format(selectedDate, "EEEE, d")
                                    : "Select a date"}
                                </p>
                              </div>
                              {selectedDate && (
                                <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                                  {TIME_SLOTS.map((timeSlot) => (
                                    <Button
                                      key={timeSlot}
                                      type="button"
                                      variant={
                                        selectedTime === timeSlot
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      className="w-full"
                                      onClick={() => setSelectedTime(timeSlot)}
                                    >
                                      {timeSlot}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedDate && selectedTime && (
                    <p className="text-sm text-muted-foreground">
                      Interview scheduled for:{" "}
                      {format(selectedDate, "MMM dd, yyyy")} at {selectedTime}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log("🔵 Cancel button clicked");
                    setIsFormOpen(false);
                    form.reset();
                    setSelectedDate(undefined);
                    setSelectedTime(null);
                  }}
                  disabled={updateFollowupMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateFollowupMutation.isPending}
                  onClick={() =>
                    console.log(
                      "🔵 Save button clicked - isPending:",
                      updateFollowupMutation.isPending
                    )
                  }
                >
                  {updateFollowupMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Follow-up Attempt
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      )}
    </Card>
  );
}
