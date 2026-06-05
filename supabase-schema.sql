-- Supabase Database Schema for XCharge EV Charging Platform
-- Run these commands in your Supabase SQL editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'hoster')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create charging_stations table
CREATE TABLE IF NOT EXISTS public.charging_stations (
  id SERIAL PRIMARY KEY,
  hoster_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  charger_type TEXT NOT NULL CHECK (charger_type IN ('Level 2', 'DC Fast')),
  price_per_kwh DECIMAL(5, 2) NOT NULL,
  hourly_rate DECIMAL(5, 2) NOT NULL,
  service_fee DECIMAL(5, 2) DEFAULT 5.00,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'in_use', 'maintenance')),
  operating_hours TEXT DEFAULT '24/7',
  features TEXT[] DEFAULT '{}',
  rating DECIMAL(2, 1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on charging_stations
ALTER TABLE public.charging_stations ENABLE ROW LEVEL SECURITY;

-- Create policies for charging_stations
CREATE POLICY "Anyone can view active charging stations" ON public.charging_stations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosters can manage their own stations" ON public.charging_stations
  FOR ALL USING (auth.uid() = hoster_id);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  station_id INTEGER REFERENCES public.charging_stations(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours DECIMAL(3, 1) NOT NULL,
  total_cost DECIMAL(8, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() IN (
    SELECT hoster_id FROM public.charging_stations WHERE id = station_id
  ));

CREATE POLICY "Customers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() IN (
    SELECT hoster_id FROM public.charging_stations WHERE id = station_id
  ));

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  station_id INTEGER REFERENCES public.charging_stations(id) ON DELETE CASCADE NOT NULL,
  booking_id INTEGER REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, station_id, booking_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND 
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id AND customer_id = auth.uid() AND status = 'completed'
    )
  );

CREATE POLICY "Customers can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = customer_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'fullName', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_charging_stations_updated_at
  BEFORE UPDATE ON public.charging_stations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample charging stations
INSERT INTO public.charging_stations (
  hoster_id,
  name,
  description,
  address,
  latitude,
  longitude,
  charger_type,
  price_per_kwh,
  hourly_rate,
  availability_status,
  operating_hours,
  features,
  rating,
  total_reviews
) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1), -- This will need to be updated with actual user ID
  'København Central Station',
  'Convenient downtown location with fast charging',
  'København H, 1570 København, Denmark',
  55.6300,
  12.4600,
  'Level 2',
  2.50,
  25.00,
  'available',
  '24/7',
  ARRAY['WiFi', 'Restrooms', 'Shopping', 'Parking'],
  4.8,
  15
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Nørreport Station',
  'Solar-powered fast charging station',
  'Nørreport, 1165 København, Denmark',
  55.6200,
  12.4500,
  'DC Fast',
  3.20,
  32.00,
  'available',
  '6 AM - 10 PM',
  ARRAY['WiFi', 'Restrooms', 'Food Court'],
  4.6,
  12
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Amager Strandpark',
  'Environmentally conscious charging solution',
  'Amager Strandpark, 2300 København, Denmark',
  55.6150,
  12.4650,
  'Level 2',
  2.10,
  21.00,
  'available',
  '5 AM - 11 PM',
  ARRAY['Beach Access', 'WiFi', 'Parking'],
  4.9,
  8
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Frederiksberg Centrum',
  '100% solar powered charging station',
  'Frederiksberg Centret, 2000 Frederiksberg, Denmark',
  55.6350,
  12.4400,
  'Level 2',
  2.30,
  23.00,
  'available',
  '24/7',
  ARRAY['Shopping', 'WiFi', 'Restrooms', 'Parking'],
  4.7,
  20
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Ørestad Station',
  'Ultra-fast charging in the heart of the city',
  'Ørestad Station, 2300 København, Denmark',
  55.6100,
  12.4800,
  'DC Fast',
  3.00,
  30.00,
  'available',
  '24/7',
  ARRAY['WiFi', 'Restrooms', 'Shopping', 'Metro Access'],
  4.5,
  10
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_charging_stations_location ON public.charging_stations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_charging_stations_hoster ON public.charging_stations(hoster_id);
CREATE INDEX IF NOT EXISTS idx_charging_stations_active ON public.charging_stations(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_station ON public.bookings(station_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_reviews_station ON public.reviews(station_id);
