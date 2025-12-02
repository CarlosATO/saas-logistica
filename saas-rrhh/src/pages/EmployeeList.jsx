import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL;

// --- COMPONENTE AUXILIAR 1: Acreditaciones y Cursos (EL SEMÁFORO) ---
const EmployeeCertifications = ({ employeeId, organizationId, coursesMaster }) => {
    const [certs, setCerts] = useState([]);
    const [newCert, setNewCert] = useState({ course_id: '', issue_date: '', expiry_date: '' });
    const [certFile, setCertFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchCerts = useCallback(async () => {
        if (!employeeId) return;
        const { data } = await supabase
            .from('rrhh_employee_certifications')
            .select(`*, course:course_id(name)`)
            .eq('employee_id', employeeId)
            .order('expiry_date', { ascending: true }); // Los que vencen pronto primero
        setCerts(data || []);
    }, [employeeId]);

    useEffect(() => { fetchCerts(); }, [fetchCerts]);

    const getStatusColor = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'bg-red-100 text-red-800 border-red-200'; // Vencido
        if (diffDays <= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Por vencer
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'; // Vigente
    };

    const getStatusLabel = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'VENCIDO';
        if (diffDays <= 30) return `VENCE EN ${diffDays} DÍAS`;
        return 'VIGENTE';
    };

    const handleSaveCert = async (e) => {
        e.preventDefault();
        if (!newCert.course_id || !certFile) { alert("Faltan datos o archivo"); return; }
        setUploading(true);

        try {
            // 1. Subir Certificado
            const fileExt = certFile.name.split('.').pop();
            const fileName = `${organizationId}/${employeeId}/cert_${newCert.course_id}_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage.from('rrhh-files').upload(fileName, certFile);
            if (uploadError) throw uploadError;

            // 2. Guardar en BD
            const { error: dbError } = await supabase.from('rrhh_employee_certifications').insert({
                employee_id: employeeId,
                organization_id: organizationId,
                course_id: newCert.course_id,
                issue_date: newCert.issue_date,
                expiry_date: newCert.expiry_date,
                certificate_url: fileName
            });

            if (dbError) throw dbError;

            alert('Acreditación agregada!');
            setNewCert({ course_id: '', issue_date: '', expiry_date: '' });
            setCertFile(null);
            fetchCerts();

        } catch (error) { alert(error.message); } finally { setUploading(false); }
    };

    return (
        <div className="space-y-6">
            {/* Lista de Cursos */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Cursos Vigentes</h3>
                {certs.length === 0 ? <p className="text-gray-400 text-sm italic">Sin acreditaciones.</p> : (
                    certs.map(c => (
                        <div key={c.id} className={`p-3 rounded-lg border flex justify-between items-center ${getStatusColor(c.expiry_date)}`}>
                            <div>
                                <div className="font-bold text-sm">{c.course.name}</div>
                                <div className="text-xs opacity-80">Vence: {c.expiry_date}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold border px-2 py-0.5 rounded bg-white bg-opacity-50">
                                    {getStatusLabel(c.expiry_date)}
                                </span>
                                {c.certificate_url && (
                                    <a href={supabase.storage.from('rrhh-files').getPublicUrl(c.certificate_url).data.publicUrl} target="_blank" rel="noreferrer" className="block text-xs underline mt-1 hover:text-black">
                                        Ver Certificado
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Formulario Agregar */}
            <form onSubmit={handleSaveCert} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <h4 className="text-sm font-bold text-gray-700">Nueva Acreditación</h4>
                <select className="w-full border p-2 rounded text-sm" value={newCert.course_id} onChange={e => setNewCert({...newCert, course_id: e.target.value})} required>
                    <option value="">Seleccionar Curso...</option>
                    {coursesMaster.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-500">Fecha Emisión</label>
                        <input type="date" className="w-full border p-2 rounded text-sm" value={newCert.issue_date} onChange={e => setNewCert({...newCert, issue_date: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Fecha Vencimiento</label>
                        <input type="date" className="w-full border p-2 rounded text-sm" value={newCert.expiry_date} onChange={e => setNewCert({...newCert, expiry_date: e.target.value})} required />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-500">Certificado (PDF/JPG)</label>
                    <input type="file" className="w-full text-sm mt-1" onChange={e => setCertFile(e.target.files[0])} required />
                </div>
                <button disabled={uploading} className="w-full bg-slate-800 text-white py-2 rounded text-sm font-medium hover:bg-slate-900">
                    {uploading ? 'Guardando...' : 'Agregar Acreditación'}
                </button>
            </form>
        </div>
    );
};

// --- COMPONENTE AUXILIAR 2: Documentos Generales ---
const EmployeeDocuments = ({ employeeId, organizationId }) => {
    const [documents, setDocuments] = useState([]);
    const [newDocType, setNewDocType] = useState('');
    const [newDocFile, setNewDocFile] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    const fetchDocuments = useCallback(async () => {
        if (!employeeId) return;
        const { data } = await supabase.from('rrhh_employee_documents').select('*').eq('employee_id', employeeId);
        setDocuments(data || []);
    }, [employeeId]);

    useEffect(() => { fetchDocuments(); }, [fetchDocuments, employeeId]);

    const handleUploadDocument = async (e) => {
        e.preventDefault();
        setUploadingDoc(true);
        try {
            const fileExt = newDocFile.name.split('.').pop();
            const fileName = `${organizationId}/${employeeId}/${newDocType}_${Date.now()}.${fileExt}`;
            await supabase.storage.from('rrhh-files').upload(fileName, newDocFile);
            await supabase.from('rrhh_employee_documents').insert({
                employee_id: employeeId, organization_id: organizationId, document_type: newDocType, file_path: fileName
            });
            alert('Documento subido!'); setNewDocType(''); setNewDocFile(null); fetchDocuments();
        } catch (error) { alert(error.message); } finally { setUploadingDoc(false); }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2">Carpeta Digital</h3>
            <ul className="space-y-2">
                {documents.map(doc => (
                    <li key={doc.id} className="flex justify-between text-sm bg-white p-2 border rounded">
                        <span>{doc.document_type}</span>
                        <a href={supabase.storage.from('rrhh-files').getPublicUrl(doc.file_path).data.publicUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Ver</a>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleUploadDocument} className="flex gap-2 items-center pt-2">
                <input className="border p-1 rounded text-sm flex-1" placeholder="Ej: Cédula" value={newDocType} onChange={e => setNewDocType(e.target.value)} required />
                <input type="file" className="text-xs w-24" onChange={e => setNewDocFile(e.target.files[0])} required />
                <button disabled={uploadingDoc} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Subir</button>
            </form>
        </div>
    );
};

// --- COMPONENTE AUXILIAR 3: PANEL LATERAL PRINCIPAL ---
const EmployeeSidePanel = ({ 
    currentEmployee, editData, setEditData, handleSave, handleDelete, handleClose, 
    uploading, masters, organizationId, handleFileUpload
}) => {
    if (!currentEmployee) return null;
    const isNew = currentEmployee.isNew;
    const formTitle = isNew ? 'Nuevo Empleado' : `${editData.first_name} ${editData.last_name}`;
    const [activeTab, setActiveTab] = useState('personal');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setEditData(prev => ({ ...prev, [name]: finalValue }));
    };
    
    const previewUrl = editData.photo_file ? URL.createObjectURL(editData.photo_file) : editData.photo_url;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end" onClick={handleClose}>
            <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* CABECERA */}
                <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center z-20">
                    <h2 className="text-xl font-bold text-slate-800">{formTitle}</h2>
                    <button onClick={handleClose} className="text-2xl font-light text-gray-400 hover:text-red-500">&times;</button>
                </div>
                
                {/* TABS */}
                <div className="flex bg-gray-50 border-b sticky top-[70px] z-20 overflow-x-auto">
                    {['personal', 'contract', 'social', 'acred', 'files'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-shrink-0 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                            {tab === 'personal' && 'Personal'}
                            {tab === 'contract' && 'Contrato'}
                            {tab === 'social' && 'Previsión'}
                            {tab === 'acred' && 'Acreditaciones'}
                            {tab === 'files' && 'Docs'}
                        </button>
                    ))}
                </div>

                <div className="p-6 flex-grow">
                    {/* 1. PERSONAL */}
                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-2 gap-4">
                             <div className="col-span-2 flex items-center gap-4 pb-4 border-b">
                                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow">
                                    {previewUrl ? <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-gray-400 font-bold">?</span>}
                                </div>
                                <label className="cursor-pointer text-xs font-bold text-blue-600 hover:underline">
                                    Subir Foto
                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0])} className="hidden" />
                                </label>
                            </div>
                            <input name="first_name" placeholder="Nombre" className="border p-2 rounded w-full" value={editData.first_name || ''} onChange={handleInputChange} />
                            <input name="last_name" placeholder="Apellido" className="border p-2 rounded w-full" value={editData.last_name || ''} onChange={handleInputChange} />
                            <input name="rut" placeholder="RUT (12.345.678-9)" className="border p-2 rounded w-full" value={editData.rut || ''} onChange={handleInputChange} />
                            <select name="marital_status_id" className="border p-2 rounded w-full bg-white" value={editData.marital_status_id || ''} onChange={handleInputChange}>
                                <option value="">Estado Civil...</option>
                                {masters.maritalStatus.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input name="address" placeholder="Dirección" className="border p-2 rounded w-full col-span-2" value={editData.address || ''} onChange={handleInputChange} />
                        </div>
                    )}

                    {/* 2. CONTRATO (Aquí está la lógica de Subcontrato) */}
                    {activeTab === 'contract' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">Cargo</label>
                                    <select name="job_id" className="border p-2 rounded w-full bg-white" value={editData.job_id || ''} onChange={handleInputChange}>
                                        <option value="">Seleccione...</option>
                                        {masters.jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Sueldo Base</label>
                                    <input name="salary" type="number" className="border p-2 rounded w-full" value={editData.salary || ''} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Fecha Ingreso</label>
                                    <input name="hire_date" type="date" className="border p-2 rounded w-full" value={editData.hire_date || ''} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Tipo Contrato</label>
                                    <select name="contract_type_id" className="border p-2 rounded w-full bg-white" value={editData.contract_type_id || ''} onChange={handleInputChange}>
                                        <option value="">Seleccione...</option>
                                        {masters.contractTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* LÓGICA DE SUBCONTRATO */}
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="is_subcontracted" 
                                        checked={editData.is_subcontracted || false} 
                                        onChange={handleInputChange} 
                                        className="w-4 h-4 text-orange-600 rounded"
                                    />
                                    <span className="text-sm font-bold text-orange-800">¿Es personal Subcontratado?</span>
                                </label>

                                {editData.is_subcontracted && (
                                    <div className="mt-3 animate-fade-in">
                                        <label className="text-xs text-orange-700 block mb-1">Empresa Contratista</label>
                                        <select 
                                            name="subcontractor_id" 
                                            className="w-full border border-orange-300 p-2 rounded bg-white"
                                            value={editData.subcontractor_id || ''}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">-- Seleccionar Empresa Externa --</option>
                                            {masters.subcontractors.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.business_name} (RUT: {sub.rut})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. SOCIAL */}
                    {activeTab === 'social' && (
                        <div className="grid grid-cols-2 gap-4">
                            <select name="pension_provider_id" className="border p-2 rounded w-full bg-white" value={editData.pension_provider_id || ''} onChange={handleInputChange}>
                                <option value="">AFP...</option>
                                {masters.pensionProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <select name="health_provider_id" className="border p-2 rounded w-full bg-white" value={editData.health_provider_id || ''} onChange={handleInputChange}>
                                <option value="">Salud...</option>
                                {masters.healthProviders.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* 4. ACREDITACIONES (Cursos y Semáforos) */}
                    {activeTab === 'acred' && (
                        !isNew ? (
                            <EmployeeCertifications 
                                employeeId={currentEmployee.id} 
                                organizationId={organizationId} 
                                coursesMaster={masters.courses} 
                            />
                        ) : <div className="text-center p-10 text-gray-400">Guarde el empleado primero.</div>
                    )}

                    {/* 5. ARCHIVOS */}
                    {activeTab === 'files' && (
                        !isNew ? (
                            <EmployeeDocuments employeeId={currentEmployee.id} organizationId={organizationId} />
                        ) : <div className="text-center p-10 text-gray-400">Guarde el empleado primero.</div>
                    )}

                    {/* BOTONES ACCIÓN (Siempre visibles al final del form activo si no es un tab de sub-componente puro) */}
                    {['personal', 'contract', 'social'].includes(activeTab) && (
                        <div className="pt-6 mt-4 border-t">
                            <button type="button" onClick={handleSave} disabled={uploading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow hover:bg-blue-700 disabled:opacity-50">
                                {uploading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            {!isNew && (
                                <button type="button" onClick={handleDelete} className="w-full mt-3 text-red-600 text-sm font-medium hover:underline">
                                    Eliminar Empleado
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const EmployeeList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [editData, setEditData] = useState({});
    const [uploading, setUploading] = useState(false);
    const [organizationId, setOrganizationId] = useState(null);
    
    // Estado unificado de maestros
    const [masters, setMasters] = useState({ 
        jobs: [], departments: [], maritalStatus: [], pensionProviders: [], healthProviders: [], 
        contractTypes: [], subcontractors: [], courses: [] 
    });

    // Carga inicial
    const initData = useCallback(async () => {
        try {
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
            const orgId = profile?.organization_id;
            if (!orgId) return;
            setOrganizationId(orgId);

            // Fetch Paralelo de Maestros
            const [j, d, m, p, h, c, sub, cur] = await Promise.all([
                supabase.from('rrhh_jobs').select('*'),
                supabase.from('rrhh_departments').select('*'),
                supabase.from('rrhh_marital_status').select('*'),
                supabase.from('rrhh_pension_providers').select('*'),
                supabase.from('rrhh_health_providers').select('*'),
                supabase.from('rrhh_contract_types').select('*'),
                supabase.from('rrhh_subcontractors').select('*').eq('organization_id', orgId),
                supabase.from('rrhh_course_catalog').select('*').eq('organization_id', orgId)
            ]);

            setMasters({
                jobs: j.data || [], departments: d.data || [], maritalStatus: m.data || [],
                pensionProviders: p.data || [], healthProviders: h.data || [], contractTypes: c.data || [],
                subcontractors: sub.data || [], courses: cur.data || []
            });

            // Fetch Empleados
            const { data: emps, error } = await supabase
                .from('rrhh_employees')
                .select(`*, job:job_id(name), subcontractor:subcontractor_id(business_name)`)
                .order('created_at', { ascending: false });
            
            if(error) throw error;
            setEmployees(emps || []);
            setLoading(false);

        } catch (error) { console.error(error); }
    }, [user]);

    useEffect(() => { if (user) initData(); }, [user, initData]);

    // Handlers
    const handleOpenCreate = () => {
        setEditData({ is_subcontracted: false, hire_date: new Date().toISOString().split('T')[0] });
        setCurrentEmployee({ isNew: true });
    };

    const handleOpenEdit = (emp) => {
        setEditData({ ...emp });
        setCurrentEmployee(emp);
    };

    const handleClose = () => { setCurrentEmployee(null); setEditData({}); };

    const handleFileUpload = (file) => { setEditData(prev => ({ ...prev, photo_file: file })); };

    const handleSave = async (e) => {
        if(e) e.preventDefault();
        setUploading(true);
        try {
            // Subida de Foto
            let photoUrl = editData.photo_url;
            if (editData.photo_file) {
                const ext = editData.photo_file.name.split('.').pop();
                const path = `${organizationId}/${currentEmployee.isNew ? 'new' : currentEmployee.id}/${Date.now()}.${ext}`;
                await supabase.storage.from('rrhh-files').upload(path, editData.photo_file);
                photoUrl = supabase.storage.from('rrhh-files').getPublicUrl(path).data.publicUrl;
            }

            const payload = {
                organization_id: organizationId,
                first_name: editData.first_name, last_name: editData.last_name, rut: editData.rut,
                job_id: editData.job_id, department_id: editData.department_id,
                salary: editData.salary, hire_date: editData.hire_date,
                contract_type_id: editData.contract_type_id,
                marital_status_id: editData.marital_status_id, address: editData.address,
                pension_provider_id: editData.pension_provider_id, health_provider_id: editData.health_provider_id,
                photo_url: photoUrl,
                // Nuevos campos
                is_subcontracted: editData.is_subcontracted,
                subcontractor_id: editData.is_subcontracted ? editData.subcontractor_id : null
            };

            if (currentEmployee.isNew) {
                await supabase.from('rrhh_employees').insert(payload);
            } else {
                await supabase.from('rrhh_employees').update(payload).eq('id', currentEmployee.id);
            }
            alert('Guardado!'); handleClose(); initData();
        } catch (error) { alert(error.message); } finally { setUploading(false); }
    };

    const handleDelete = async () => {
        if(!window.confirm("¿Eliminar?")) return;
        try {
            await supabase.from('rrhh_employees').delete().eq('id', currentEmployee.id);
            handleClose(); initData();
        } catch (error) { alert(error.message); }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Personal</h1>
                        <p className="text-slate-500">Gestión de RRHH, Contratistas y Acreditaciones</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/settings/subcontractors')} className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium">🏢 Contratistas</button>
                        <button onClick={() => navigate('/settings/courses')} className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium">🎓 Cursos</button>
                        <button onClick={() => window.location.href = PORTAL_URL} className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium">⬅ Portal</button>
                        <button onClick={handleOpenCreate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow">+ Nuevo</button>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-bold">
                            <tr>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Cargo</th>
                                <th className="p-4">Empresa</th>
                                <th className="p-4">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {employees.map(e => (
                                <tr key={e.id} onClick={() => handleOpenEdit(e)} className="hover:bg-blue-50 cursor-pointer transition-colors">
                                    <td className="p-4 font-medium">{e.first_name} {e.last_name}</td>
                                    <td className="p-4 text-sm text-gray-600">{e.job?.name || '-'}</td>
                                    <td className="p-4 text-sm">
                                        {e.is_subcontracted ? (
                                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">
                                                {e.subcontractor?.business_name || 'Externo'}
                                            </span>
                                        ) : (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                                                Planta
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-xs text-gray-400">Activo</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <EmployeeSidePanel 
                currentEmployee={currentEmployee}
                editData={editData} setEditData={setEditData}
                handleSave={handleSave} handleDelete={handleDelete} handleClose={handleClose}
                uploading={uploading} masters={masters} organizationId={organizationId}
                handleFileUpload={handleFileUpload}
            />
        </div>
    );
};

export default EmployeeList;