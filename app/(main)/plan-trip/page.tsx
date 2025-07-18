import TripInputForm from "@/components/trip-planning/TripInputForm";

export default function PlanTripPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Plan Your Trip to Marrakech</h1>
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#555' }}>
        Provide your travel details, and our AI will generate personalized itineraries for you.
      </p>
      <TripInputForm />
    </div>
  );
}