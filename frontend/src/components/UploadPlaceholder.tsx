import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadCloud } from "lucide-react";
import type { ComponentProps } from "react";

interface UploadPlaceholderProps extends ComponentProps<typeof Button> {
    label: string;
}

export function UploadPlaceholder({ label, ...props }: UploadPlaceholderProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            <Button variant="outline" disabled {...props}>
              <UploadCloud className="mr-2 h-4 w-4" />
              {label}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Backend coming soon</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
