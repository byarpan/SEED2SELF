import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { 
  User, 
  MapPin, 
  Sprout, 
  ShieldCheck, 
  ShieldAlert, 
  Camera, 
  Calendar, 
  Mail, 
  Phone, 
  Layers, 
  CheckCircle2, 
  XCircle,
  FileCheck2,
  Lock,
  UserCog,
  Star
} from "lucide-react";
import AdvancedGenderPicker from "@/components/common/ProfileControls/AdvancedGenderPicker";
import AdvancedDatePicker from "@/components/common/ProfileControls/AdvancedDatePicker";

export default function StakeholderProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  // Rating states
  const [reviewValue, setReviewValue] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewHoverValue, setReviewHoverValue] = useState(0);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const renderStars = (rating: number, interactive: boolean = false, hoverValue: number = 0, onClick?: (v: number) => void, onMouseEnter?: (v: number) => void, onMouseLeave?: () => void) => {
    const stars = [];
    const displayVal = interactive ? (hoverValue || rating) : rating;
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= displayVal;
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${
            isFilled 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-stone-600 fill-stone-800"
          } ${interactive ? "cursor-pointer hover:scale-110 transition" : ""}`}
          onClick={() => interactive && onClick && onClick(i)}
          onMouseEnter={() => interactive && onMouseEnter && onMouseEnter(i)}
          onMouseLeave={() => interactive && onMouseLeave && onMouseLeave()}
        />
      );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  const handleSubmitReview = async () => {
    setReviewError("");
    setReviewSuccess("");
    setSubmittingReview(true);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: reviewValue,
          comment: reviewComment,
          reviewerId: session?.user?.id,
          revieweeId: id,
        })
      });

      const data = await res.json();

      if (res.ok) {
        setReviewSuccess("Review submitted successfully!");
        setReviewComment("");
        setReviewValue(5);
        fetchProfile();
      } else {
        setReviewError(data.message || "Failed to submit review.");
      }
    } catch (err) {
      setReviewError("Failed to connect to the server.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Upload refs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const aadhaarFrontInputRef = useRef<HTMLInputElement>(null);
  const aadhaarBackInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [profilePhoto, setProfilePhoto] = useState("");
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  
  const [permanentAddress, setPermanentAddress] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [pinCode, setPinCode] = useState("");

  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [landArea, setLandArea] = useState("");
  const [mainCrops, setMainCrops] = useState("");
  const [farmingType, setFarmingType] = useState("");

  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarFront, setAadhaarFront] = useState("");
  const [aadhaarBack, setAadhaarBack] = useState("");
  const [kycStatus, setKycStatus] = useState("Pending Verification");
  const [rejectionReason, setRejectionReason] = useState("");

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchProfile = async () => {
    if (!id) return;
    const res = await fetch(`/api/users/${id}`);
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      
      // Initialize form fields
      setProfilePhoto(data.profilePhoto || "");
      setName(data.name || "");
      setMobileNumber(data.mobileNumber || "");
      setDob(data.dob || "");
      setGender(data.gender || "Male");

      setPermanentAddress(data.permanentAddress || "");
      setState(data.state || "");
      setDistrict(data.district || "");
      setVillage(data.village || "");
      setPinCode(data.pinCode || "");

      setFarmName(data.farmName || "");
      setFarmLocation(data.farmLocation || "");
      setLandArea(data.landArea !== null && data.landArea !== undefined ? String(data.landArea) : "");
      setMainCrops(data.mainCrops || "");
      setFarmingType(data.farmingType || "");

      setAadhaarNumber(data.aadhaarNumber || "");
      setAadhaarFront(data.aadhaarFront || "");
      setAadhaarBack(data.aadhaarBack || "");
      setKycStatus(data.kycStatus || "Pending Verification");
      setRejectionReason(data.rejectionReason || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (!id || !session?.user?.id) return;
    const fetchMessages = async () => {
      const res = await fetch(`/api/messages?userId=${session.user.id}&otherUserId=${id}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    };
    fetchMessages();
  }, [id, session?.user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id || !id) return;

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: session.user.id,
        receiverId: id as string,
        content: newMessage
      })
    });

    if (res.ok) {
      const msg = await res.json();
      setMessages([...messages, msg]);
      setNewMessage("");
    }
  };

  // Convert File to Base64
  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "aadhaar_front" | "aadhaar_back") => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    try {
      const base64 = await toBase64(file);
      const res = await fetch("/api/users/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, type })
      });

      if (res.ok) {
        const data = await res.json();
        if (type === "profile") {
          setProfilePhoto(data.url);
          // Auto-save profile photo directly for responsive user experience
          await fetch(`/api/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profilePhoto: data.url })
          });
        } else if (type === "aadhaar_front") {
          setAadhaarFront(data.url);
        } else if (type === "aadhaar_back") {
          setAadhaarBack(data.url);
        }
        setSubmitMessage({ type: "success", text: `${type.replace("_", " ")} uploaded successfully!` });
      } else {
        const data = await res.json();
        setSubmitMessage({ type: "error", text: data.message || "Failed to upload image" });
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage({ type: "error", text: "Error reading image file." });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage({ type: "", text: "" });

    // Client-side validations
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      setSubmitMessage({ type: "error", text: "Mobile number must be a 10-digit number" });
      return;
    }
    if (pinCode && !/^\d{6}$/.test(pinCode)) {
      setSubmitMessage({ type: "error", text: "PIN code must be a 6-digit number" });
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobileNumber,
          dob,
          gender,
          permanentAddress,
          state,
          district,
          village,
          pinCode,
          farmName,
          farmLocation,
          landArea,
          mainCrops,
          farmingType,
          profilePhoto,
          aadhaarNumber,
          aadhaarFront,
          aadhaarBack,
          submitKyc: true,
        })
      });

      if (res.ok) {
        setSubmitMessage({ type: "success", text: "Profile updated successfully!" });
        setEditMode(false);
        fetchProfile();
      } else {
        const data = await res.json();
        setSubmitMessage({ type: "error", text: data.message || "Failed to update profile" });
      }
    } catch (err) {
      setSubmitMessage({ type: "error", text: "Internal server error." });
    }
  };

  const handleSubmitKYC = async () => {
    setSubmitMessage({ type: "", text: "" });

    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      setSubmitMessage({ type: "error", text: "Please enter a valid 12-digit Aadhaar Number" });
      return;
    }
    if (!aadhaarFront || !aadhaarBack) {
      setSubmitMessage({ type: "error", text: "Please upload both Aadhaar front and back documents" });
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaarNumber,
          aadhaarFront,
          aadhaarBack,
          submitKyc: true
        })
      });

      if (res.ok) {
        setSubmitMessage({ type: "success", text: "KYC documents submitted successfully for verification!" });
        fetchProfile();
      } else {
        const data = await res.json();
        setSubmitMessage({ type: "error", text: data.message || "Failed to submit KYC documents" });
      }
    } catch (err) {
      setSubmitMessage({ type: "error", text: "Internal server error." });
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white font-medium">Loading Profile...</div>;
  if (!user) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white font-medium">User not found</div>;

  const isOwnProfile = session?.user?.id === id;
  const isFarmer = user.role === "FARMER";
  const isProcessor = user.role === "PROCESSOR";

  const canReview = !isOwnProfile && session?.user && (
    (user.role === "FARMER" && session.user.role === "PROCESSOR") ||
    (user.role === "PROCESSOR" && session.user.role === "DISTRIBUTOR") ||
    (user.role === "DISTRIBUTOR" && session.user.role === "RETAILER") ||
    (user.role === "RETAILER" && ["CUSTOMER", "USER", "FARMER", "PROCESSOR", "DISTRIBUTOR", "RETAILER"].includes(session.user.role))
  );

  const getCannotReviewReason = () => {
    if (!session?.user) return "Log in to leave a review.";
    if (isOwnProfile) return "You cannot review your own profile.";
    
    if (user.role === "FARMER") return "Only processors are authorized to leave reviews on farmers.";
    if (user.role === "PROCESSOR") return "Only distributors are authorized to leave reviews on processors.";
    if (user.role === "DISTRIBUTOR") return "Only retailers are authorized to leave reviews on distributors.";
    return "Only authorized partners can leave reviews on this profile.";
  };
  const displayWallet = user.walletAddress 
    ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}` 
    : "";

  return (
    <div className="min-h-screen bg-stone-950 relative text-white pt-10 pb-20 z-20">
      {/* Solid Dark Background Overlay (Matching Wallet Style) */}
      <div className="fixed inset-0 bg-stone-950 z-[-1] pointer-events-none"></div>

      <Head>
        <title>{user.name}'s Profile | Seed2Shelf</title>
      </Head>
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/1031700/pexels-photo-1031700.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
          className="w-full h-full object-cover opacity-20"
          alt=""
        />
        <div className="absolute inset-0 bg-[#0d0d0d]/90"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Banner Alert Message */}
        {submitMessage.text && (
          <div className={`p-4 mb-6 rounded-2xl border text-sm font-bold flex items-center gap-2 ${
            submitMessage.type === "success" 
              ? "bg-green-500/10 border-green-500/20 text-[#00d26a]" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            <span>{submitMessage.text}</span>
          </div>
        )}

        {/* Profile Header Header Card */}
        <div className="matte-glass p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl mb-8 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-80 h-80 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition duration-500"></div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Profile Photo and Star Rating Wrapper */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative w-32 h-32 rounded-full border-4 border-white/10 group cursor-pointer overflow-hidden shadow-2xl flex items-center justify-center bg-[#1a1a1a]">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#162a1e] to-[#254d33] flex items-center justify-center font-black text-5xl text-[#00d26a] select-none">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                {isOwnProfile && (
                  <div 
                    onClick={() => profileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center gap-1.5"
                  >
                    <Camera className="h-5 w-5 text-[#00d26a]" />
                    <span className="text-[10px] font-black text-[#00d26a] uppercase tracking-wider">Change</span>
                  </div>
                )}
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={profileInputRef}
                  onChange={(e) => handleFileUpload(e, "profile")}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              {/* Star Rating Summary Under Image Portion */}
              <div className="flex flex-col items-center bg-black/30 px-3 py-1.5 rounded-2xl border border-white/5 shadow-inner">
                {user.averageRating ? (
                  <>
                    {renderStars(Number(user.averageRating))}
                    <span className="text-xs font-extrabold text-[#00d26a] mt-1 drop-shadow">
                      {Number(user.averageRating).toFixed(1)} / 5.0
                    </span>
                    <span className="text-[10px] font-semibold text-stone-400">
                      ({user.ratings?.length || 0} reviews)
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-stone-500 font-bold italic py-1">No reviews yet</span>
                )}
              </div>
            </div>

            <div className="text-center md:text-left flex-grow">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-extrabold text-white flex items-center gap-2.5">
                    {user.name}
                    {user.kycStatus === "Verified" && (
                      <span className="flex items-center gap-1 bg-[#00d26a]/15 text-[#00d26a] border border-[#00d26a]/20 text-xs font-black uppercase px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </h1>
                  <p className="text-sm font-semibold text-[#00d26a] tracking-wider uppercase mt-1">{user.role}</p>
                </div>
                
                {isOwnProfile && (
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-2 bg-[#00d26a]/10 hover:bg-[#00d26a] text-[#00d26a] hover:text-black border border-[#00d26a]/20 px-5 py-2.5 rounded-xl font-bold transition-all text-sm shrink-0 cursor-pointer shadow-lg shadow-[#00d26a]/5"
                  >
                    <UserCog className="h-4 w-4" />
                    {editMode ? "Cancel Editing" : "Edit Profile"}
                  </button>
                )}
              </div>
              
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-stone-400">
                {user.farmerId && (
                  <span className="bg-stone-900 border border-white/5 px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-mono text-white">
                    ID: {user.farmerId}
                  </span>
                )}
                {user.processorId && (
                  <span className="bg-stone-900 border border-white/5 px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-mono text-white">
                    ID: {user.processorId}
                  </span>
                )}
                <span className="bg-stone-900 border border-white/5 px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-stone-300">
                  <Mail className="h-3.5 w-3.5 text-[#00d26a]" />
                  {user.email}
                </span>
                {user.mobileNumber && (
                  <span className="bg-stone-900 border border-white/5 px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-stone-300">
                    <Phone className="h-3.5 w-3.5 text-[#00d26a]" />
                    {user.mobileNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE WORKSPACE */}
        {isOwnProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-8">
            
            {/* Basic Information section */}
            <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl">
              <h2 className="text-xl font-black text-green-300 mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-[#00d26a]" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Full Name</label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Email Address (Read Only)</label>
                  <input
                    type="text"
                    disabled
                    value={user.email}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-stone-500 focus:outline-none transition cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Mobile Number</label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter 10 digit number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Date of Birth</label>
                  <AdvancedDatePicker value={dob} onChange={setDob} editMode={editMode} label="Date of Birth" />
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Gender</label>
                  <AdvancedGenderPicker value={gender} onChange={setGender} editMode={editMode} />
                </div>
                {isFarmer && (
                  <div>
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Farmer ID (Read Only)</label>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-bold text-[#00d26a]">
                      {user.farmerId || "N/A"}
                    </div>
                  </div>
                )}
                {isProcessor && (
                  <div>
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Processor ID (Read Only)</label>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-bold text-[#00d26a]">
                      {user.processorId || "N/A"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal address section */}
            <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl">
              <h2 className="text-xl font-black text-green-300 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#00d26a]" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Permanent Address</label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    placeholder="Street name, house number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">State</label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">District</label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Mysore"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Village</label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Hunsur"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">PIN Code</label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="6 digit code"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                  />
                </div>
              </div>
            </div>

            {/* Farm Information Section */}
            {isFarmer && (
              <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl">
                <h2 className="text-xl font-black text-green-300 mb-6 flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-[#00d26a]" />
                  Farm Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Farm Name</label>
                    <input
                      type="text"
                      disabled={!editMode}
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Kumar Organic Farms"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Farm Location</label>
                    <input
                      type="text"
                      disabled={!editMode}
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      placeholder="e.g. Mysore Outskirts"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Total Land Area (Acres)</label>
                    <input
                      type="number"
                      step="any"
                      disabled={!editMode}
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder="e.g. 5.5"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Main Crops</label>
                    <input
                      type="text"
                      disabled={!editMode}
                      value={mainCrops}
                      onChange={(e) => setMainCrops(e.target.value)}
                      placeholder="e.g. Mangoes, Ragi"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Farming Type</label>
                    <input
                      type="text"
                      disabled={!editMode}
                      value={farmingType}
                      onChange={(e) => setFarmingType(e.target.value)}
                      placeholder="e.g. Organic, Cooperative"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">Registration Date (Read Only)</label>
                    <input
                      type="text"
                      disabled
                      value={user.regDate ? new Date(user.regDate).toLocaleDateString() : new Date(user.createdAt).toLocaleDateString()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-stone-500 focus:outline-none transition cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Profile Button */}
            {editMode && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#00d26a] hover:bg-[#00b25a] text-black font-extrabold px-10 py-4 rounded-2xl transition shadow-lg shadow-[#00d26a]/20 hover:scale-[1.01] cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            )}
          </form>
        ) : (
          /* Public Stakeholder profile card */
          <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl mb-8 space-y-6">
            <h2 className="text-xl font-bold text-green-300">Public Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.farmerId && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-stone-400 text-xs font-bold uppercase mb-1">Farmer ID</h3>
                  <p className="font-mono text-sm text-white">{user.farmerId}</p>
                </div>
              )}
              {user.processorId && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-stone-400 text-xs font-bold uppercase mb-1">Processor ID</h3>
                  <p className="font-mono text-sm text-white">{user.processorId}</p>
                </div>
              )}
              {user.farmName && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-stone-400 text-xs font-bold uppercase mb-1">Farm Name</h3>
                  <p className="text-sm text-white">{user.farmName}</p>
                </div>
              )}
              {user.farmLocation && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-stone-400 text-xs font-bold uppercase mb-1">Farm Location</h3>
                  <p className="text-sm text-white">{user.farmLocation}</p>
                </div>
              )}
              {user.mainCrops && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-stone-400 text-xs font-bold uppercase mb-1">Main Crops</h3>
                  <p className="text-sm text-white">{user.mainCrops}</p>
                </div>
              )}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h3 className="text-stone-400 text-xs font-bold uppercase mb-1">Wallet Address</h3>
                <p className="font-mono text-sm text-blue-400 break-all">{displayWallet || "Not Linked"}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h3 className="text-stone-400 text-xs font-bold uppercase mb-1">Member Since</h3>
                <p className="text-sm text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* KYC Verification Section (Only for Farmers/Processors viewing own profile or Admin review) */}
        {isOwnProfile && (isFarmer || isProcessor) && (
          <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-black text-green-300 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00d26a]" />
                KYC Verification (Aadhaar Card)
              </h2>
              
              <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-full border ${
                kycStatus === "Verified"
                  ? "bg-[#00d26a]/15 text-[#00d26a] border-[#00d26a]/20"
                  : kycStatus === "Rejected"
                    ? "bg-red-500/15 text-red-400 border-red-500/20"
                    : "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
              }`}>
                {kycStatus}
              </span>
            </div>

            {kycStatus === "Rejected" && rejectionReason && (
              <div className="p-4 mb-6 bg-red-500/15 border border-red-500/20 rounded-2xl text-xs text-red-300">
                <span className="font-bold block mb-1">Rejection Reason:</span>
                {rejectionReason}
              </div>
            )}

            {kycStatus === "Verified" && user.verificationDate && (
              <div className="p-4 mb-6 bg-green-500/15 border border-green-500/20 rounded-2xl text-xs text-[#00d26a] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Verification completed on {new Date(user.verificationDate).toLocaleString()}</span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1 flex items-center gap-1">
                  12-Digit Aadhaar Number
                  {kycStatus === "Verified" && <Lock className="h-3 w-3 text-stone-500" />}
                </label>
                <input
                  type="text"
                  maxLength={12}
                  disabled={kycStatus === "Verified"}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="Enter 12 digit numeric value"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] disabled:opacity-60 transition"
                />
              </div>

              {/* Document uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Aadhaar Front */}
                <div className="border border-dashed border-white/10 rounded-2xl p-6 bg-black/20 flex flex-col items-center justify-center min-h-[220px] text-center relative overflow-hidden group">
                  {aadhaarFront ? (
                    <>
                      <img src={aadhaarFront} alt="Aadhaar Front" className="w-full h-40 object-contain rounded-lg" />
                      {kycStatus !== "Verified" && (
                        <button
                          onClick={() => aadhaarFrontInputRef.current?.click()}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-white text-xs font-bold"
                        >
                          <Camera className="h-5 w-5" />
                          Replace Front Image
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <ShieldAlert className="h-8 w-8 text-yellow-500 mx-auto" />
                      <div>
                        <h4 className="font-bold text-sm">Aadhaar Front Image</h4>
                        <p className="text-xs text-stone-500 mt-1">Upload JPEG/PNG front-facing file</p>
                      </div>
                      <button
                        onClick={() => aadhaarFrontInputRef.current?.click()}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/15 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Upload Front File
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={aadhaarFrontInputRef}
                    onChange={(e) => handleFileUpload(e, "aadhaar_front")}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                {/* Aadhaar Back */}
                <div className="border border-dashed border-white/10 rounded-2xl p-6 bg-black/20 flex flex-col items-center justify-center min-h-[220px] text-center relative overflow-hidden group">
                  {aadhaarBack ? (
                    <>
                      <img src={aadhaarBack} alt="Aadhaar Back" className="w-full h-40 object-contain rounded-lg" />
                      {kycStatus !== "Verified" && (
                        <button
                          onClick={() => aadhaarBackInputRef.current?.click()}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-white text-xs font-bold"
                        >
                          <Camera className="h-5 w-5" />
                          Replace Back Image
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <ShieldAlert className="h-8 w-8 text-yellow-500 mx-auto" />
                      <div>
                        <h4 className="font-bold text-sm">Aadhaar Back Image</h4>
                        <p className="text-xs text-stone-500 mt-1">Upload JPEG/PNG address-facing file</p>
                      </div>
                      <button
                        onClick={() => aadhaarBackInputRef.current?.click()}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/15 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Upload Back File
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={aadhaarBackInputRef}
                    onChange={(e) => handleFileUpload(e, "aadhaar_back")}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

              </div>

              {kycStatus !== "Verified" && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitKYC}
                    className="bg-[#00d26a] hover:bg-[#00b25a] text-black font-extrabold px-8 py-3.5 rounded-xl transition shadow-lg shadow-[#00d26a]/20 hover:scale-[1.01] cursor-pointer"
                  >
                    Submit KYC for Verification
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ratings & Reviews Section */}
        <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-300 flex items-center gap-2">
              <Star className="h-6 w-6 text-[#00d26a] fill-[#00d26a]" />
              Ratings & Reviews
            </h2>
            {user.averageRating && (
              <span className="text-sm font-semibold bg-green-500/10 text-[#00d26a] border border-[#00d26a]/20 px-3 py-1 rounded-xl">
                Average: {Number(user.averageRating).toFixed(1)} ★
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews List Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-stone-300 mb-4">User Reviews</h3>
              {!user.ratings || user.ratings.length === 0 ? (
                <p className="text-stone-500 italic text-sm">No reviews received yet.</p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {user.ratings.map((rating: any) => (
                    <div key={rating.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex gap-4">
                      {/* Reviewer avatar */}
                      <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center bg-stone-900 border border-white/10 text-green-400 font-black text-sm select-none">
                        {rating.reviewer?.profilePhoto ? (
                          <img src={rating.reviewer.profilePhoto} alt={rating.reviewer.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          rating.reviewer?.name ? rating.reviewer.name[0].toUpperCase() : "R"
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <h4 className="font-bold text-white text-sm">{rating.reviewer?.name}</h4>
                            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">{rating.reviewer?.role}</p>
                          </div>
                          <span className="text-[10px] text-stone-500 font-medium">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2">
                          {renderStars(rating.value)}
                        </div>
                        {rating.comment && (
                          <p className="mt-2 text-stone-300 text-sm bg-black/10 p-3 rounded-xl border border-white/5">
                            {rating.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Give Review Column (Only shown for authorized users who are viewing someone else's profile) */}
            <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
              {canReview ? (
                <div>
                  <h3 className="text-lg font-bold text-stone-300 mb-4">Submit a Review</h3>
                  
                  {reviewSuccess && (
                    <div className="p-3 mb-4 text-xs font-bold bg-[#00d26a]/15 text-[#00d26a] border border-[#00d26a]/20 rounded-xl">
                      {reviewSuccess}
                    </div>
                  )}

                  {reviewError && (
                    <div className="p-3 mb-4 text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/20 rounded-xl">
                      {reviewError}
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div className="mb-4">
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Rating</label>
                    {renderStars(reviewValue, true, reviewHoverValue, setReviewValue, setReviewHoverValue, () => setReviewHoverValue(0))}
                  </div>

                  {/* Comment input */}
                  <div className="mb-4">
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Review Comment</label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience working with this stakeholder..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] text-sm resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="w-full bg-[#00d26a] hover:bg-[#00b25a] disabled:opacity-50 text-black font-extrabold py-3 rounded-xl transition shadow-lg text-sm cursor-pointer"
                  >
                    {submittingReview ? "Submitting..." : "Post Review"}
                  </button>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl text-center">
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {getCannotReviewReason()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isOwnProfile && session?.user && (
          <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[500px]">
            <h2 className="text-2xl font-bold mb-6 text-green-300">Direct Messages</h2>
            
            <div className="flex-grow overflow-y-auto pr-4 mb-6 custom-scrollbar space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-stone-400 mt-10 italic">No messages yet. Say hello!</p>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === session.user.id;
                  return (
                    <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl ${isMine ? 'bg-green-600/80 rounded-br-none text-white' : 'bg-white/10 rounded-bl-none text-stone-100'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-[10px] opacity-60 mt-2 block">{new Date(msg.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-4">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message to negotiate or ask questions..."
                className="flex-grow bg-white/5 border border-white/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-green-500 transition"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl transition shadow-lg"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
