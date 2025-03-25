import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PromotionBannerProps {
  code?: string;
  discount?: string;
  message?: string;
}

export default function PromotionBanner({ 
  code = "WELCOME100", 
  discount = "₹100 OFF", 
  message = "your first order" 
}: PromotionBannerProps) {
  const { toast } = useToast();

  const handleApply = () => {
    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: "Promo Code Copied!",
        description: `${code} has been copied to your clipboard.`,
      });
    });
  };

  return (
    <div className="my-4 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-900 dark:to-primary-800 rounded-lg p-4 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-poppins font-semibold text-lg">{discount} {message}</h3>
          <p className="text-sm text-primary-100">Use code: {code}</p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          className="bg-white text-primary-700 font-medium hover:bg-white/90"
          onClick={handleApply}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
