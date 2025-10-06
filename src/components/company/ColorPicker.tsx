import { useState } from "react";
// @ts-expect-error - Type mismatch in third-party library
import { GooglePicker } from "react-color";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label = "Assign a Primary Color for Client" }: ColorPickerProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="w-12 h-10 rounded border cursor-pointer"
              style={{ backgroundColor: value }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1"
              placeholder="#000000"
            />
            <span className="text-sm text-gray-600">100%</span>
          </div>
          {showColorPicker && (
            <div className="absolute z-10">
              <div
                className="fixed inset-0"
                onClick={() => setShowColorPicker(false)}
              />
              <GooglePicker
                color={value}
                onChange={(color: any) => onChange(color.hex)}
              />
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
