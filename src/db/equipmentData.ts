// src/db/equipmentData.ts

export interface EquipmentItem {
  id: string;
  category: 'A. Professional Fees' | 'Camera Package' | 'Audio Package' | 'Lighting Package' | 'Grips & Motion' | 'Drones & Action' | 'C. Post Production';
  name: string;
  brand: string;
  rateKes: number;
  specs: string;
  isPopular?: boolean; // 💡 Flag for Most Popular suggestions
}

// 💡 Complete Equipment Database extracted from your Excel Inventory Sheet
export const equipmentDatabase: EquipmentItem[] = [
  // A. Professional Fees
  { id: 'pf_1', category: 'A. Professional Fees', name: 'Lead Videographer (DOP)', brand: 'Professional Fee', rateKes: 35000, specs: 'Video DOP & Creative Lead', isPopular: true },
  { id: 'pf_2', category: 'A. Professional Fees', name: 'Lead Photographer', brand: 'Professional Fee', rateKes: 30000, specs: 'Studio & event photography', isPopular: true },
  { id: 'pf_3', category: 'A. Professional Fees', name: 'Production Assistant / Focus Puller', brand: 'Professional Fee', rateKes: 10000, specs: 'On-set technical support' },

  // Drones & Action
  { id: 'drn_1', category: 'Drones & Action', name: 'DJI Mavic 4 Pro Drone with Fly More Combo', brand: 'DJI', rateKes: 15000, specs: 'Pro Aerial Photography', isPopular: true },
  { id: 'drn_2', category: 'Drones & Action', name: 'DJI Air 3 Drone Fly More Combo with RC 2', brand: 'DJI', rateKes: 14000, specs: '4K Dual-Camera Drone' },
  { id: 'drn_3', category: 'Drones & Action', name: 'DJI Mavic 3 Classic Drone', brand: 'DJI', rateKes: 10000, specs: 'Hasselblad 4K Aerial Camera' },
  { id: 'drn_4', category: 'Drones & Action', name: 'DJI Air 3S Drone with RC 2 Fly More Combo', brand: 'DJI', rateKes: 9000, specs: '4K Aerial Camera' },

  // Cameras (Cinema & Mirrorless)
  { id: 'cam_fx6', category: 'Camera Package', name: 'Sony FX6 Digital Cinema Camera Body', brand: 'Sony', rateKes: 8500, specs: '4K Full-Frame Cinema Body', isPopular: true },
  { id: 'cam_fx3', category: 'Camera Package', name: 'Sony FX3 Full-Frame Cinema Camera', brand: 'Sony', rateKes: 7000, specs: '4K Full-Frame Handheld Cinema', isPopular: true },
  { id: 'cam_a7iv', category: 'Camera Package', name: 'Sony a7 IV Mirrorless Camera', brand: 'Sony', rateKes: 5000, specs: '4K Hybrid Photo & Video Body', isPopular: true },
  { id: 'cam_arri_mini', category: 'Camera Package', name: 'ARRI ALEXA MINI Cinema Camera Body', brand: 'ARRI', rateKes: 20000, specs: 'Industry Standard Cinema Body', isPopular: true },
  { id: 'cam_arri35', category: 'Camera Package', name: 'ARRI ALEXA 35 Lightweight Set with CCM-1 Monitor', brand: 'ARRI', rateKes: 50000, specs: '4.6K Super 35 Cinema Camera' },
  { id: 'cam_venice2', category: 'Camera Package', name: 'Sony VENICE 2 Digital Motion Picture Camera (8K)', brand: 'Sony', rateKes: 40000, specs: '8K Full-Frame Motion Picture Body' },
  { id: 'cam_burano', category: 'Camera Package', name: 'Sony BURANO 8K Digital Cinema Camera Kit', brand: 'Sony', rateKes: 25000, specs: '8K Cine Body with Remote Grip' },
  { id: 'cam_c400', category: 'Camera Package', name: 'Canon EOS C400 6K Full-Frame Digital Cinema Camera (RF)', brand: 'Canon', rateKes: 10000, specs: '6K Full-Frame Cinema' },
  { id: 'cam_c80', category: 'Camera Package', name: 'Canon EOS C80 6K Full-Frame Cinema Camera (RF)', brand: 'Canon', rateKes: 8000, specs: '6K Full-Frame Cinema' },
  { id: 'cam_komodo', category: 'Camera Package', name: 'RED DIGITAL CINEMA KOMODO 6K Camera', brand: 'RED', rateKes: 7000, specs: '6K Super 35 Global Shutter' },
  { id: 'cam_a7s3', category: 'Camera Package', name: 'Sony Alpha a7S III Mirrorless Camera', brand: 'Sony', rateKes: 6000, specs: '4K 120fps Low-Light Master' },
  { id: 'cam_bmpcc6k', category: 'Camera Package', name: 'Blackmagic Pocket Cinema Camera 6K Pro', brand: 'Blackmagic', rateKes: 6000, specs: '6K EF Mount Cinema' },
  { id: 'cam_c70', category: 'Camera Package', name: 'Canon EOS C70 4K Cinema Camera (RF Mount)', brand: 'Canon', rateKes: 7000, specs: '4K Super 35 Cinema' },
  { id: 'cam_r5c', category: 'Camera Package', name: 'Canon EOS R5 C 8K Cinema Mirrorless', brand: 'Canon', rateKes: 7000, specs: '8K RAW Hybrid Camera' },
  { id: 'cam_z8', category: 'Camera Package', name: 'Nikon Z8 Mirrorless Camera', brand: 'Nikon', rateKes: 8000, specs: '8K RAW Mirrorless Body' },
  { id: 'cam_fx30', category: 'Camera Package', name: 'Sony FX30 Super 35 Cinema Camera', brand: 'Sony', rateKes: 5000, specs: '4K Super 35 Cine' },

  // Lenses
  { id: 'lens_zoom', category: 'Camera Package', name: 'Sony / Canon Zoom Lens Set (24-70mm, 70-200mm)', brand: 'Sony / Canon', rateKes: 3000, specs: 'F2.8 Cine Zoom Lens Set', isPopular: true },
  { id: 'lens_arri_primes', category: 'Camera Package', name: 'ARRI Signature Prime 6-Lens Core Set (LPL)', brand: 'ARRI', rateKes: 90000, specs: 'LPL Mount Full-Frame Cine Primes' },
  { id: 'lens_dzofilm', category: 'Camera Package', name: 'DZOFilm VESPID Prime 7-Lens Kit V2 (PL & EF)', brand: 'DZOFilm', rateKes: 35000, specs: '7 Cine Prime Lenses' },
  { id: 'lens_zeiss_cp3', category: 'Camera Package', name: 'ZEISS CP.3 5-Lens Set (PL Mount)', brand: 'ZEISS', rateKes: 30000, specs: '5 Compact Prime Cine Lenses' },
  { id: 'lens_canon_servo', category: 'Camera Package', name: 'Canon CN7x17 Cine-Servo 17-120mm T2.95 (PL)', brand: 'Canon', rateKes: 15000, specs: 'PL Mount Cine-Servo' },

  // Lighting Package
  { id: 'lit_aputure600d', category: 'Lighting Package', name: 'Aputure LS 600d Pro Daylight LED Monolight', brand: 'Aputure', rateKes: 5000, specs: '600W High-Output Daylight LED', isPopular: true },
  { id: 'lit_amaran200d', category: 'Lighting Package', name: 'Amaran 200D or Neewer LED Panel Lights', brand: 'Amaran', rateKes: 3000, specs: '200W Bi-Color LED', isPopular: true },
  { id: 'lit_v1', category: 'Lighting Package', name: 'Godox V1 Speedlight Flash', brand: 'Godox', rateKes: 1000, specs: 'Round-head Flash', isPopular: true },
  { id: 'lit_arri_m40', category: 'Lighting Package', name: 'ARRI M40 HMI 2.5/4kW Kit with Ballast', brand: 'ARRI', rateKes: 10000, specs: '4kW High-Output HMI Daylight' },
  { id: 'lit_aputure1200', category: 'Lighting Package', name: 'Aputure LS 1200d Pro LED Light Kit', brand: 'Aputure', rateKes: 10000, specs: '1200W Daylight LED Monolight' },
  { id: 'lit_aputure600c', category: 'Lighting Package', name: 'Aputure LS 600c Pro RGB LED Monolight', brand: 'Aputure', rateKes: 8000, specs: '600W Full-Color RGB LED' },
  { id: 'lit_aputure600x', category: 'Lighting Package', name: 'Aputure LS 600x Pro Bi-Color LED Monolight', brand: 'Aputure', rateKes: 7000, specs: '600W Bi-Color LED' },
  { id: 'lit_skypanel', category: 'Lighting Package', name: 'ARRI SkyPanel S120-C LED Softlight', brand: 'ARRI', rateKes: 6000, specs: 'Broad Full-Color LED Soft Panel' },
  { id: 'lit_godox600', category: 'Lighting Package', name: 'Godox AD600 Pro Outdoor Strobe', brand: 'Godox', rateKes: 1500, specs: '600Ws Battery Strobe' },

  // Audio Package
  { id: 'aud_dji_mic', category: 'Audio Package', name: 'Wireless Lavalier Mic (Dual Set - DJI/Rode/Saramonic)', brand: 'DJI / RODE', rateKes: 2000, specs: 'Primary interview audio', isPopular: true },
  { id: 'aud_boom', category: 'Audio Package', name: 'Shotgun Mic + Carbon Boom Pole', brand: 'RODE', rateKes: 1500, specs: 'Environmental & backup capture', isPopular: true },
  { id: 'aud_zoom_h6', category: 'Audio Package', name: 'Audio Recorder (Zoom H5/H6)', brand: 'Zoom', rateKes: 1000, specs: 'Main Event & Podcast recording', isPopular: true },
  { id: 'aud_sounddev', category: 'Audio Package', name: 'Sound Devices MixPre-10 II 12-Track Recorder', brand: 'Sound Devices', rateKes: 5000, specs: '32-Bit Float Field Recorder' },
  { id: 'aud_zoom_f8n', category: 'Audio Package', name: 'Zoom F8n 8-Input / 10-Track Field Recorder', brand: 'Zoom', rateKes: 5000, specs: '8-Channel Field Recorder' },
  { id: 'aud_sony_uwp', category: 'Audio Package', name: 'Sony UWP-D27 2-Person Camera Wireless Mics', brand: 'Sony', rateKes: 4000, specs: 'Dual Channel Camera Wireless' },
  { id: 'aud_rodecaster', category: 'Audio Package', name: 'RODE RODECaster Video Production Console', brand: 'RODE', rateKes: 7000, specs: 'Video/Audio Production Studio' },
  { id: 'aud_hollyland', category: 'Audio Package', name: 'Hollyland Solidcom C1-8S Intercom System (8 Headsets)', brand: 'Hollyland', rateKes: 1000, specs: '8-Person Duplex Intercom' },

  // Grips & Motion
  { id: 'grp_rs3pro', category: 'Grips & Motion', name: 'DJI Ronin RS3 / RS4 Pro Gimbal Stabilizer', brand: 'DJI', rateKes: 4000, specs: '3-Axis Carbon Gimbal', isPopular: true },
  { id: 'grp_easyrig', category: 'Grips & Motion', name: 'Easyrig Vario5 Camera Support Vest', brand: 'Easyrig', rateKes: 20000, specs: 'Body Support System', isPopular: true },
  { id: 'grp_tripod', category: 'Grips & Motion', name: 'Heavy Duty Video Tripod', brand: 'Cartoni / Sachtler', rateKes: 1000, specs: 'Camera support equipment', isPopular: true },
  { id: 'grp_ronin2', category: 'Grips & Motion', name: 'DJI Ronin 2 Professional 3-Axis Gimbal', brand: 'DJI', rateKes: 20000, specs: 'Heavy Cinema Camera Gimbal' },
  { id: 'grp_crane', category: 'Grips & Motion', name: 'Proaim 38′ Base Kit Camera Jib Crane', brand: 'Proaim', rateKes: 20000, specs: '38-Foot Camera Jib Crane' },
  { id: 'grp_oconnor', category: 'Grips & Motion', name: 'OConnor 2575E Head & 150mm Cine Tripod System', brand: 'OConnor', rateKes: 17000, specs: '150mm Fluid Cine Head' },
  { id: 'grp_emotimo', category: 'Grips & Motion', name: 'eMotimo Spectrum ST4 Pro + Dana Dolly Integration', brand: 'eMotimo', rateKes: 15000, specs: '4-Axis Motion Control Slider' },
  { id: 'grp_danadolly', category: 'Grips & Motion', name: 'Dana Dolly Portable Dolly System Rental Kit', brand: 'Dana Dolly', rateKes: 6000, specs: 'Track Dolly System' },
  { id: 'grp_booth', category: 'Grips & Motion', name: '360 Photo Booth Platform with Operator', brand: 'KIPSMTHN', rateKes: 35000, specs: '360 Rotating Photo Platform' },

  // C. Post Production
  { id: 'post_3', category: 'C. Post Production', name: 'Video Postproduction (Coverage + Highlight)', brand: 'Post Production', rateKes: 7000, specs: 'Coverage + Highlight video + Interviews', isPopular: true },
  { id: 'post_2', category: 'C. Post Production', name: 'Short Form - Social Reels (9:16)', brand: 'Post Production', rateKes: 2000, specs: 'Optimized Reels / Shorts', isPopular: true },
  { id: 'post_1', category: 'C. Post Production', name: 'Long Form Video Editing', brand: 'Post Production', rateKes: 7000, specs: 'Full event / podcast cut' },
  { id: 'post_4', category: 'C. Post Production', name: 'Photo Postproduction & Retouching', brand: 'Post Production', rateKes: 10000, specs: 'Color grading & high-res exports' },
];