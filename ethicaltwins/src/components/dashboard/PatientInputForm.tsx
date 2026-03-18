import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dna, User, Activity, Globe } from "lucide-react";
import type { PatientInput } from "@/types/patient";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const countries = [
  "United States", "United Kingdom", "Germany", "France", "Japan",
  "China", "India", "Brazil", "Australia", "Canada", "South Korea",
  "Mexico", "Italy", "Spain", "Netherlands", "Nigeria", "South Africa"
];

const ethnicities = [
  "Caucasian", "African", "Asian", "Hispanic/Latino", "Middle Eastern",
  "South Asian", "East Asian", "Southeast Asian", "Pacific Islander",
  "Native American", "Mixed/Other"
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  age: z.coerce.number().min(18, "Age must be at least 18").max(120, "Age must be realistic"),
  height: z.coerce.number().min(100, "Height must be at least 100cm").max(250, "Height must be realistic"),
  weight: z.coerce.number().min(30, "Weight must be at least 30kg").max(300, "Weight must be realistic"),
  bloodGroup: z.string().min(1, "Please select a blood group"),
  country: z.string().min(1, "Please select a country"),
  ethnicity: z.string().min(1, "Please select an ethnicity"),
  biologicalMarkers: z.string().optional(),
});

interface PatientInputFormProps {
  onSubmit: (data: PatientInput) => void;
  isLoading: boolean;
  voiceData?: Record<string, unknown> | null;
}

export function PatientInputForm({ onSubmit, isLoading, voiceData }: PatientInputFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: 35,
      height: 170,
      weight: 70,
      bloodGroup: "",
      country: "",
      ethnicity: "",
      biologicalMarkers: "",
    },
  });

  // Apply voice data to form
  useEffect(() => {
    if (voiceData) {
      Object.entries(voiceData).forEach(([key, value]) => {
        if (value !== undefined && key in form.getValues()) {
          form.setValue(key as any, value as any, { shouldValidate: true });
        }
      });
    }
  }, [voiceData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as PatientInput);
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Patient Profile</CardTitle>
            <CardDescription>
              Enter the base patient characteristics to generate synthetic twins
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="35" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Physical Measurements */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="170" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="70" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bloodGroups.map((bg) => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Demographics */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Country
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ethnicity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ethnicity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ethnicity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ethnicities.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Biological Markers */}
            <FormField
              control={form.control}
              name="biologicalMarkers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Biological Markers (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., Cholesterol: 180mg/dL, Blood Pressure: 120/80, Glucose: 95mg/dL"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full gap-2" 
              size="lg"
              disabled={isLoading}
            >
              <Dna className="h-5 w-5" />
              {isLoading ? "Generating Twins..." : "Generate Synthetic Twins"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
