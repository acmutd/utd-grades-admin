"use client"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ACCEPTED_FILE = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
const FormSchema = z.object({
  semester: z.union([z.literal('Fall'), z.literal('Summer'), z.literal('Spring')]),
  year: z.number().min(1970),
  file: z.instanceof(File, { message: "File required" }).refine((file) => ACCEPTED_FILE.includes(file.type), {
    message: "Expected Excel file"
  }),
})

export default function Home() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      semester: "Fall",
    }
  })
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const rawFileBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target!.result);
      }
      reader.onerror = (err) => {
        reject(err);
      }
      reader.readAsDataURL(data.file);
    });
    const response = await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({
        buffer: rawFileBuffer as any,
        semester: data.semester,
        year: data.year,
      }),
      headers: {
        'Content-Type': "application/json"
      }
    });
    const result = await response.json();
    alert(result.msg);
  }
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-24"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            await onSubmit(data);
          })}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Semester of the grade distribution</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input  {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} type="number" placeholder="Input year here" />
                </FormControl>
                <FormDescription>
                  Year of the grade distribution
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="file"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Grade Distribution</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    placeholder="Upload grade distribution data here"
                    type="file"
                    onChange={(e) => onChange(e.target.files && e.target.files[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </main>
  );

}
