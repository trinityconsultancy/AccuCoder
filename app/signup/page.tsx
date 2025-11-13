'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    certificationType: '', // 'AAPC' or 'AHIMA'
    certificationId: '',
    organization: '',
    position: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        throw new Error('Please fill in all required fields')
      }

      if (!formData.certificationType || !formData.certificationId) {
        throw new Error('Please select certification type and provide your certification ID')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Strong password validation
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }
      if (!/[A-Z]/.test(formData.password)) {
        throw new Error('Password must contain at least one uppercase letter')
      }
      if (!/[a-z]/.test(formData.password)) {
        throw new Error('Password must contain at least one lowercase letter')
      }
      if (!/[0-9]/.test(formData.password)) {
        throw new Error('Password must contain at least one number')
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        throw new Error('Password must contain at least one special character (!@#$%^&*...)')
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation for demo
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            aapc_id: formData.certificationType === 'AAPC' ? formData.certificationId : null,
            ahima_id: formData.certificationType === 'AHIMA' ? formData.certificationId : null,
            organization: formData.organization || null,
            position: formData.position || null
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error(`Profile creation failed: ${profileError.message}`)
        }

        setSuccess(true)
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      console.error('Signup error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up'
      
      // Check if it's an email rate limit error
      if (errorMessage.includes('rate limit') || errorMessage.includes('magic link')) {
        setError('Email confirmation is temporarily unavailable. Please disable email confirmation in Supabase Dashboard (Authentication → Providers → Email) or use the Login page if you already have an account.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
          <p className="text-muted-foreground mb-4">
            Please check your email to verify your account.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image 
            src="/images/design-mode/AccuCoder.png" 
            alt="AccuCoder" 
            width={160}
            height={40}
            className="h-10 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">
            Join AccuCoder and start coding smarter
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="john.doe@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="••••••••"
              />
              {formData.password && (
                <div className="mt-2 p-2 bg-secondary/30 rounded-md">
                  <p className="text-xs font-medium mb-1.5">Password Requirements:</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}`}>
                      <span className="text-[10px]">{formData.password.length >= 8 ? '✓' : '○'}</span>
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'}`}>
                      <span className="text-[10px]">{/[A-Z]/.test(formData.password) ? '✓' : '○'}</span>
                      <span>Uppercase</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'}`}>
                      <span className="text-[10px]">{/[a-z]/.test(formData.password) ? '✓' : '○'}</span>
                      <span>Lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'}`}>
                      <span className="text-[10px]">{/[0-9]/.test(formData.password) ? '✓' : '○'}</span>
                      <span>Number</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'}`}>
                      <span className="text-[10px]">{/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '✓' : '○'}</span>
                      <span>Special char</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Professional Certification */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="certificationType" className="block text-sm font-medium mb-2">
                  Certification Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="certificationType"
                  name="certificationType"
                  value={formData.certificationType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="">Select Certification</option>
                  <option value="AAPC">AAPC</option>
                  <option value="AHIMA">AHIMA</option>
                </select>
              </div>
              <div>
                <label htmlFor="certificationId" className="block text-sm font-medium mb-2">
                  Certification ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="certificationId"
                  name="certificationId"
                  value={formData.certificationId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder={formData.certificationType ? `Enter ${formData.certificationType} ID` : "Select certification first"}
                  disabled={!formData.certificationType}
                />
              </div>
            </div>

            {/* Organization and Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="organization" className="block text-sm font-medium mb-2">
                  Organization / Company
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    list="organizations-list"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Type or select organization"
                    autoComplete="off"
                  />
                  <datalist id="organizations-list">
                    <option value="3M Health Information Systems" />
                    <option value="A+ Medical Management" />
                    <option value="AAPC (American Academy of Professional Coders)" />
                    <option value="Ability Network" />
                    <option value="AccuReg" />
                    <option value="Accenture Health" />
                    <option value="Access Healthcare" />
                    <option value="Acclara HealthInsights" />
                    <option value="Accretive Health" />
                    <option value="Accumedic" />
                    <option value="Accu-Coding Solutions" />
                    <option value="AccuMed Billing" />
                    <option value="Accureg Solutions" />
                    <option value="Acro Medical Billing" />
                    <option value="AdaptHealth" />
                    <option value="Advanced Data Systems (ADS)" />
                    <option value="Advanced MD" />
                    <option value="Advantum Health" />
                    <option value="Aetna" />
                    <option value="AHIMA (American Health Information Management Association)" />
                    <option value="Allscripts" />
                    <option value="Alpha II" />
                    <option value="AllianceOne Receivables Management" />
                    <option value="AMN Healthcare" />
                    <option value="Anthem (Elevance Health)" />
                    <option value="Anesthesia Business Consultants" />
                    <option value="Apexon" />
                    <option value="Apollo MD" />
                    <option value="Arcadia Solutions" />
                    <option value="Argus Health Systems" />
                    <option value="Ascension" />
                    <option value="Athenahealth" />
                    <option value="Availity" />
                    <option value="Aviacode" />
                    <option value="Banner Health" />
                    <option value="Bayada Home Health Care" />
                    <option value="Billing Freedom" />
                    <option value="BillingParadise" />
                    <option value="BillingTree" />
                    <option value="Blue Cross Blue Shield" />
                    <option value="BluePearl" />
                    <option value="BodySite" />
                    <option value="Bon Secours Mercy Health" />
                    <option value="Brightree" />
                    <option value="Cactus Medical Billing" />
                    <option value="Candor" />
                    <option value="CapMinds Technologies" />
                    <option value="Capario" />
                    <option value="Capterra Medical Billing" />
                    <option value="Cardinal Health" />
                    <option value="Care Cloud" />
                    <option value="CareFirst BlueCross BlueShield" />
                    <option value="Carium" />
                    <option value="Casenet" />
                    <option value="Cedar" />
                    <option value="Cedars-Sinai" />
                    <option value="Centauri Health Solutions" />
                    <option value="Centene Corporation" />
                    <option value="CenterWell" />
                    <option value="Cerner (Oracle Health)" />
                    <option value="Certiphi Screening" />
                    <option value="Change Healthcare" />
                    <option value="Charter Medical" />
                    <option value="ChartLogic" />
                    <option value="ChartWise Medical Systems" />
                    <option value="Ciox Health" />
                    <option value="Cigna" />
                    <option value="CitiusTech" />
                    <option value="ClarisHealth" />
                    <option value="Clearway Health" />
                    <option value="Cleveland Clinic" />
                    <option value="Clinical Solutions" />
                    <option value="Cloudmed" />
                    <option value="CodingCertification.org" />
                    <option value="Coding Network" />
                    <option value="Coding Strategies Inc" />
                    <option value="Cognizant" />
                    <option value="Collectly" />
                    <option value="Collective Medical" />
                    <option value="CommonSpirit Health" />
                    <option value="CompuGroup Medical" />
                    <option value="Conifer Health Solutions" />
                    <option value="Connexin Software" />
                    <option value="Consult QD" />
                    <option value="Cotiviti" />
                    <option value="Craneware" />
                    <option value="CrossCountry Healthcare" />
                    <option value="CVS Health" />
                    <option value="Definitive Healthcare" />
                    <option value="DexCare" />
                    <option value="DrChrono" />
                    <option value="Dynafios" />
                    <option value="e-MDs" />
                    <option value="EClinicalWorks" />
                    <option value="Emdeon" />
                    <option value="Ensemble Health Partners" />
                    <option value="Epic Systems" />
                    <option value="Episource" />
                    <option value="eREVCycle" />
                    <option value="Experian Health" />
                    <option value="ezDI" />
                    <option value="Fathom" />
                    <option value="Find-A-Code" />
                    <option value="Firstsource Solutions" />
                    <option value="Five9" />
                    <option value="Flywire" />
                    <option value="Fox Rehabilitation" />
                    <option value="Freed" />
                    <option value="Fresenius Medical Care" />
                    <option value="Fusion Medical Staffing" />
                    <option value="Garnet Health" />
                    <option value="Gateway EDI" />
                    <option value="Geisinger" />
                    <option value="GeBBS Healthcare Solutions" />
                    <option value="GE Healthcare" />
                    <option value="GHX" />
                    <option value="Global Healthcare Resource" />
                    <option value="GoodRx" />
                    <option value="Greenway Health" />
                    <option value="GTMHub Health" />
                    <option value="Guardian Life" />
                    <option value="Guidehouse" />
                    <option value="H&R Healthcare" />
                    <option value="Harris Computer" />
                    <option value="HCA Healthcare" />
                    <option value="HCPro" />
                    <option value="Health Catalyst" />
                    <option value="HealthEdge" />
                    <option value="HealthFirst" />
                    <option value="Health Information Associates (HIA)" />
                    <option value="HealthNet" />
                    <option value="Health Payment Systems" />
                    <option value="HealthRules" />
                    <option value="HealthStream" />
                    <option value="Healthicity" />
                    <option value="Healthfuse" />
                    <option value="Healthlink Advisors" />
                    <option value="Healthmine" />
                    <option value="Healthpac" />
                    <option value="Healthplan Services" />
                    <option value="Healthwise" />
                    <option value="HealthX" />
                    <option value="HHS" />
                    <option value="HGS Healthcare" />
                    <option value="HITconsultant" />
                    <option value="Homeward" />
                    <option value="Horizon Healthcare Services" />
                    <option value="Humana" />
                    <option value="Huron Consulting Group" />
                    <option value="IASIS Healthcare" />
                    <option value="iCare Health Network" />
                    <option value="ICON Medical Coding" />
                    <option value="Infor" />
                    <option value="Infosys BPM" />
                    <option value="Ingenious Med" />
                    <option value="InstaMed" />
                    <option value="Inovalon" />
                    <option value="Integra Connect" />
                    <option value="Intermountain Healthcare" />
                    <option value="Invoice Cloud" />
                    <option value="IQVIA" />
                    <option value="iRhythm" />
                    <option value="iSalus Healthcare" />
                    <option value="Johns Hopkins Medicine" />
                    <option value="Kaiser Permanente" />
                    <option value="Kareo" />
                    <option value="Konica Minolta" />
                    <option value="Laboratory Corporation of America" />
                    <option value="Landa" />
                    <option value="LexisNexis" />
                    <option value="LifeBridge Health" />
                    <option value="LifePoint Health" />
                    <option value="Lumedic" />
                    <option value="M*Modal (3M)" />
                    <option value="MakroCare" />
                    <option value="Mass General Brigham" />
                    <option value="Matrix Medical Network" />
                    <option value="Maxim Health Information Services" />
                    <option value="Mayo Clinic" />
                    <option value="McKesson" />
                    <option value="MD Clarity" />
                    <option value="MDaudit" />
                    <option value="MedAssets" />
                    <option value="MedBridge" />
                    <option value="MedData" />
                    <option value="Medecision" />
                    <option value="Medhost" />
                    <option value="Medical Billing Advocates of America" />
                    <option value="Medical Billing Wholesalers" />
                    <option value="Medical Coding Pro" />
                    <option value="Medical Management Professionals" />
                    <option value="Medical Record Associates (MRA)" />
                    <option value="Medical Reimbursements of America" />
                    <option value="Medicaid" />
                    <option value="Medicare" />
                    <option value="MediQuant" />
                    <option value="Mediware" />
                    <option value="MedPro" />
                    <option value="MedRisk" />
                    <option value="Medsphere" />
                    <option value="MedSynergies" />
                    <option value="MedTouch" />
                    <option value="MedVision" />
                    <option value="Merative (IBM Watson Health)" />
                    <option value="Merchant Medicine" />
                    <option value="Merge Healthcare (IBM)" />
                    <option value="Miracle Coding" />
                    <option value="ModMed" />
                    <option value="Molina Healthcare" />
                    <option value="Multiplan" />
                    <option value="MyScribe" />
                    <option value="National Medical Billing Services" />
                    <option value="Navicure" />
                    <option value="NextGen Healthcare" />
                    <option value="Noridian Healthcare Solutions" />
                    <option value="North Highland" />
                    <option value="Northwell Health" />
                    <option value="Northwest Medical Coding" />
                    <option value="Novant Health" />
                    <option value="nThrive" />
                    <option value="Nuance Healthcare (Dragon Medical)" />
                    <option value="NYU Langone Health" />
                    <option value="Ochsner Health" />
                    <option value="Office Ally" />
                    <option value="Olive" />
                    <option value="Omnicell" />
                    <option value="OnBase by Hyland" />
                    <option value="Optum" />
                    <option value="Oracle Health (Cerner)" />
                    <option value="OSP Labs" />
                    <option value="Outsource Strategies International" />
                    <option value="PartnerSource" />
                    <option value="Parallon" />
                    <option value="Parathon" />
                    <option value="Patientco" />
                    <option value="PatientPay" />
                    <option value="Payor Logic" />
                    <option value="PCCI" />
                    <option value="PeaceHealth" />
                    <option value="Ped-i-Care" />
                    <option value="Perot Systems (Dell Services)" />
                    <option value="Perspective RCM" />
                    <option value="Philips Healthcare" />
                    <option value="Physicians Immediate Care" />
                    <option value="Pinnacle Healthcare Consulting" />
                    <option value="PlanSource" />
                    <option value="PointClickCare" />
                    <option value="Practice Management Institute" />
                    <option value="Practis" />
                    <option value="Premier Inc" />
                    <option value="PrimePay" />
                    <option value="ProCare Medical Billing" />
                    <option value="Proove Biosciences" />
                    <option value="Providence" />
                    <option value="Quartet Health" />
                    <option value="Quest Diagnostics" />
                    <option value="R1 RCM" />
                    <option value="RadNet" />
                    <option value="Recondo Technology" />
                    <option value="Record Nations" />
                    <option value="Recurly" />
                    <option value="Regulatory Compliance Associates" />
                    <option value="RelayHealth (McKesson)" />
                    <option value="Remit Data" />
                    <option value="Revenue Enterprises" />
                    <option value="Revenue Med" />
                    <option value="Revint" />
                    <option value="RevWorks" />
                    <option value="RLDatix" />
                    <option value="ROI Solutions" />
                    <option value="Rush University Medical Center" />
                    <option value="Salesforce Health Cloud" />
                    <option value="Salient Healthcare" />
                    <option value="Sanford Health" />
                    <option value="SCAN Health Plan" />
                    <option value="Scripps Health" />
                    <option value="Sentara Healthcare" />
                    <option value="SGS North America" />
                    <option value="Sharp HealthCare" />
                    <option value="Siemens Healthineers" />
                    <option value="Simbo.AI" />
                    <option value="SimplePractice" />
                    <option value="Solutionreach" />
                    <option value="Solventum" />
                    <option value="Spectrum Health" />
                    <option value="SSI Group" />
                    <option value="SSM Health" />
                    <option value="Stanford Health Care" />
                    <option value="Sterling" />
                    <option value="Sutter Health" />
                    <option value="Synzi" />
                    <option value="Tata Consultancy Services (TCS)" />
                    <option value="Tebra" />
                    <option value="TempDev" />
                    <option value="Tenet Healthcare" />
                    <option value="The Coding Institute" />
                    <option value="The SSI Group" />
                    <option value="Tivity Health" />
                    <option value="Transworld Systems" />
                    <option value="Trella Health" />
                    <option value="Trinity Health" />
                    <option value="TriZetto" />
                    <option value="TruBridge" />
                    <option value="Truven Health Analytics (IBM Watson)" />
                    <option value="UCLA Health" />
                    <option value="UCSF Health" />
                    <option value="UMass Memorial Health" />
                    <option value="UnitedHealth Group" />
                    <option value="Universal Health Services" />
                    <option value="University of Pittsburgh Medical Center" />
                    <option value="US Radiology" />
                    <option value="VA (Veterans Affairs)" />
                    <option value="Vee Technologies" />
                    <option value="Veradigm" />
                    <option value="Veritas Medical Solutions" />
                    <option value="Verisk Health" />
                    <option value="Vesta Healthcare" />
                    <option value="Vikor Scientific" />
                    <option value="Visiant" />
                    <option value="Vistar Healthcare" />
                    <option value="VitalWare" />
                    <option value="Vituity" />
                    <option value="vizientinc" />
                    <option value="Waystar" />
                    <option value="WebPT" />
                    <option value="WellCare" />
                    <option value="WellSky" />
                    <option value="White Glove Health" />
                    <option value="Wipro" />
                    <option value="Wolters Kluwer" />
                    <option value="Xealth" />
                    <option value="Xerox Healthcare" />
                    <option value="Zotec Partners" />
                    <option value="ZyDoc" />
                  </datalist>
                </div>
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium mb-2">
                  Position / Title
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Your role"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              onClick={() => router.push('/login')}
              className="text-primary font-medium hover:underline"
            >
              Log in
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
