import { Link } from "react-router-dom";
import type { Pack } from "../../types/pack";
import { Button } from "../ui/Button";

interface PackActionButtonsProps {
  pack: Pack;
}

export function PackActionButtons({ pack }: PackActionButtonsProps) {
  return (
    <div className="flex justify-end gap-4">
      <Link to={`/packs/${pack.id}/payment`}>
        <Button variant="primary" className="px-6 py-3">
          Make Contribution
        </Button>
      </Link>

      <Link to={`/packs/${pack.id}/manage`}>
        <Button variant="secondary" className="px-6 py-3">
          Manage Members
        </Button>
      </Link>
    </div>
  );
}

