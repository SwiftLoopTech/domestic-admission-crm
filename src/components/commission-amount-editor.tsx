"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCommissions } from "@/hooks/useCommissions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CommissionAmountEditorProps {
  commissionId: string;
  initialAmount: number;
}

export function CommissionAmountEditor({
  commissionId,
  initialAmount
}: CommissionAmountEditorProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [isEditing, setIsEditing] = useState(false);
  const { updateCommission, isUpdatingCommission } = useCommissions();

  const handleSave = () => {
    updateCommission({
      commissionId,
      data: { amount }
    }, {
      onSuccess: () => {
        setIsEditing(false);
        toast.success("Commission amount updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update commission amount: ${error.message}`);
      }
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="w-32"
            min={0}
            step={0.01}
          />
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAmount(initialAmount);
                setIsEditing(false);
              }}
              disabled={isUpdatingCommission}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUpdatingCommission}
            >
              {isUpdatingCommission ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="font-medium">{formatCurrency(amount)}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(true)}
      >
        Edit
      </Button>
    </div>
  );
}
