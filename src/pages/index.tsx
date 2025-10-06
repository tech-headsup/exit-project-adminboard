const dummyData: { totalInterviews: number; interviewers: Interviewer[] } = {
  totalInterviews: 24,
  interviewers: [
    {
      name: "Tanya",
      total: 8,
      interns: [
        { name: "Intern 1", count: 3 },
        { name: "Intern 2", count: 2 },
        { name: "Intern 3", count: 3 },
      ],
    },
    {
      name: "Pratibha",
      total: 8,
      interns: [
        { name: "Intern 1", count: 3 },
        { name: "Intern 2", count: 2 },
        { name: "Intern 3", count: 3 },
      ],
    },
    {
      name: "Eswar",
      total: 8,
      interns: [
        { name: "Intern 1", count: 3 },
        { name: "Intern 2", count: 2 },
        { name: "Intern 3", count: 3 },
      ],
    },
  ],
};

import { toast } from "sonner";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <CompanyStats
          stats={[
            { value: "12", label: "Total no of Active Companies" },
            { value: "3", label: "Total added Companies" },
            {
              value: "4",
              label: "Companies where the project is yet to start",
            },
            { value: "8", label: "Dormant Companies" },
          ]}
        />
        {/* <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
        <div className="flex gap-4 w-full">
          <div className="flex-3">
            <ValueLineBarChart />
          </div>
          <div className="flex-1">
            <InterviewSchedule
              totalInterviews={dummyData.totalInterviews}
              interviewers={dummyData.interviewers}
            />
          </div>
        </div>
      </div>
    </>
  );
}

import { ArrowRight, Calendar, TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, XAxis, ReferenceLine } from "recharts";
import React from "react";
import { AnimatePresence } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { JetBrains_Mono } from "next/font/google";
import { useMotionValueEvent, useSpring } from "framer-motion";
import CompanyStats from "@/components/CompaniesComponents/companiesStats";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const CHART_MARGIN = 35;

const chartData = [
  { month: "January", desktop: 342 },
  { month: "February", desktop: 676 },
  { month: "March", desktop: 512 },
  { month: "April", desktop: 629 },
  { month: "May", desktop: 458 },
  { month: "June", desktop: 781 },
  { month: "July", desktop: 394 },
  { month: "August", desktop: 924 },
  { month: "September", desktop: 647 },
  { month: "October", desktop: 532 },
  { month: "November", desktop: 803 },
  { month: "December", desktop: 271 },
  { month: "January", desktop: 342 },
  { month: "February", desktop: 876 },
  { month: "March", desktop: 512 },
  { month: "April", desktop: 629 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(221, 83%, 53%)",
    // color: "var(--secondary-foreground)",
  },
} satisfies ChartConfig;

export function ValueLineBarChart() {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(
    undefined
  );

  const maxValueIndex = React.useMemo(() => {
    // if user is moving mouse over bar then set value to the bar value
    if (activeIndex !== undefined) {
      return { index: activeIndex, value: chartData[activeIndex].desktop };
    }
    // if no active index then set value to max value
    return chartData.reduce(
      (max, data, index) => {
        return data.desktop > max.value ? { index, value: data.desktop } : max;
      },
      { index: 0, value: 0 }
    );
  }, [activeIndex]);

  const maxValueIndexSpring = useSpring(maxValueIndex.value, {
    stiffness: 100,
    damping: 20,
  });

  const [springyValue, setSpringyValue] = React.useState(maxValueIndex.value);

  useMotionValueEvent(maxValueIndexSpring, "change", (latest) => {
    setSpringyValue(Number(latest.toFixed(0)));
  });

  React.useEffect(() => {
    maxValueIndexSpring.set(maxValueIndex.value);
  }, [maxValueIndex.value, maxValueIndexSpring]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className={cn(jetBrainsMono.className, "text-2xl tracking-tighter")}
          >
            {maxValueIndex.value}
          </span>
          {/* <Badge variant="secondary"> */}
          {/* <TrendingUp className="h-4 w-4" /> */}
          {/* <span>5.2%</span> */}
          {/* </Badge> */}
        </CardTitle>
        <CardDescription>Total Interviews conducted</CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <ChartContainer
            config={chartConfig}
            className="h-[350px] aspect-auto"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              onMouseLeave={() => setActiveIndex(undefined)}
              margin={{
                left: CHART_MARGIN,
              }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4}>
                {chartData.map((_, index) => (
                  <Cell
                    className="duration-200"
                    opacity={index === maxValueIndex.index ? 1 : 0.1}
                    key={index}
                    onMouseEnter={() => setActiveIndex(index)}
                  />
                ))}
              </Bar>
              <ReferenceLine
                opacity={0.4}
                y={springyValue}
                stroke="var(--secondary-foreground)"
                strokeWidth={1}
                strokeDasharray="3 3"
                label={<CustomReferenceLabel value={maxValueIndex.value} />}
              />
            </BarChart>
          </ChartContainer>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

interface CustomReferenceLabelProps {
  viewBox?: {
    x?: number;
    y?: number;
  };
  value: number;
}

const CustomReferenceLabel: React.FC<CustomReferenceLabelProps> = (props) => {
  const { viewBox, value } = props;
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0;

  // we need to change width based on value length
  const width = React.useMemo(() => {
    const characterWidth = 8; // Average width of a character in pixels
    const padding = 10;
    return value.toString().length * characterWidth + padding;
  }, [value]);

  return (
    <>
      <rect
        x={x - CHART_MARGIN}
        y={y - 9}
        width={width}
        height={18}
        // fill="var(--secondary-foreground)"
        fill="hsl(221, 83%, 53%)"
        rx={4}
      />
      <text
        fontWeight={600}
        x={x - CHART_MARGIN + 6}
        y={y + 4}
        fill="var(--primary-foreground)"
      >
        {value}
      </text>
    </>
  );
};

// ---------------------------------------

interface Intern {
  name: string;
  count: number;
}

interface Interviewer {
  name: string;
  total: number;
  interns: Intern[];
}

interface InterviewScheduleProps {
  totalInterviews: number;
  interviewers: Interviewer[];
}

const InterviewSchedule: React.FC<InterviewScheduleProps> = ({
  totalInterviews,
  interviewers,
}) => {
  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-gray-600 text-xs font-normal mb-2">
            Total Interviews scheduled for today
          </h2>
          <div className="text-3xl font-semibold text-indigo-900">
            {totalInterviews}
          </div>
        </div>
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Calendar className="w-5 h-5 text-indigo-600" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 mb-4"></div>

      {/* Interviewers List */}
      <div className="space-y-4">
        {interviewers.map((interviewer, index) => (
          <div key={index}>
            {/* Interviewer Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-indigo-900">
                {interviewer.name}
              </h3>
              <span className="text-lg font-semibold text-gray-900">
                {interviewer.total}
              </span>
            </div>

            {/* Intern Details */}
            <div className="space-y-2 ml-2">
              {interviewer.interns.map((intern, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-normal">
                    {intern.name}
                  </span>
                  <span className="text-sm text-gray-700 font-normal">
                    {intern.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
