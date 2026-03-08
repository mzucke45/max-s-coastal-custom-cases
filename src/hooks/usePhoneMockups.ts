import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PhoneMockup {
  id: string;
  model_id: string;
  back_image_url: string;
  overlay_image_url: string;
  case_area_x: number;
  case_area_y: number;
  case_area_width: number;
  case_area_height: number;
}

export function usePhoneMockup(modelId: string | null) {
  const [mockup, setMockup] = useState<PhoneMockup | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!modelId) { setMockup(null); return; }
    setLoading(true);
    supabase
      .from("phone_mockups" as any)
      .select("*")
      .eq("model_id", modelId)
      .maybeSingle()
      .then(({ data }) => {
        setMockup(data as unknown as PhoneMockup | null);
        setLoading(false);
      });
  }, [modelId]);

  return { mockup, loading };
}

export function useAllPhoneMockups() {
  const [mockups, setMockups] = useState<PhoneMockup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("phone_mockups" as any)
      .select("*")
      .then(({ data }) => {
        setMockups((data as unknown as PhoneMockup[] | null) || []);
        setLoading(false);
      });
  }, []);

  const refetch = () => {
    setLoading(true);
    supabase
      .from("phone_mockups" as any)
      .select("*")
      .then(({ data }) => {
        setMockups((data as unknown as PhoneMockup[] | null) || []);
        setLoading(false);
      });
  };

  return { mockups, loading, refetch };
}
