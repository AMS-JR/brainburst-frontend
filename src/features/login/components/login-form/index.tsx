import Button from "../../../common/components/button";
import {Login} from "../../../common/icons/login.tsx";
import {type FormEvent, useState} from "react";
import {Link} from "react-router-dom";
import {login} from "../../../../lib/data/auth.ts";
import {useNavigate} from "react-router-dom";
import {Bounce, toast, ToastContainer} from "react-toastify";


const LoginForm = () => {
    const [form, setForm] = useState({email: '', password: ''});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const result = await login({ email: form.email, password: form.password });
            if (result.success) {
                setForm({ email: '', password: '' });
                navigate("/games/selection");
                return;
            }
            if (result.error === "UserAlreadyAuthenticatedException") {
                navigate("/games/selection");
            } else {
                toast.error("Password or Email is incorrect ", {
                    position: "top-right",
                    autoClose: 5000,
                    theme: "colored",
                    transition: Bounce,
                });
            }
            setForm({ ...form, password: "" });
        } catch (err) {
            console.error("Login error", err);
            setForm({ ...form, password: "" });
        }
    };

    return (
        <div>
            <form className={"space-y-10"}>
                <div className={"space-y-3"}>
                    <div className="flex flex-col justify-between items-start gap-2 mt-2 text-white ">
                        <div>
                            <label htmlFor="email" className={"text-sm"}>Email</label>
                        </div>
                        <input type={"email"} className={"input-field"} value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}/>
                    </div>
                    <div className="flex flex-col justify-between items-start gap-2 mt-2 text-white">
                        <div>
                            <label htmlFor="password" className={"text-sm"}>Password</label>
                        </div>
                        <input type={showPassword ? "text" : "password"} className={"input-field"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}/>
                    </div>
                    <div className={"flex justify-between text-gray-500 gap-2 text-sm"}>
                        <div>
                            <input type="checkbox"  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setShowPassword(e.target.checked);
                            }} value="show"/>
                            <label htmlFor="email" className={"ml-1"}>Show password</label>
                        </div>
                        <Link to={"/auth/forgot-password"} className={"text-sm"}>
                            <div>Forgot Password abc?</div>
                        </Link>
                    </div>

                </div>
                <Button icon={<Login/>} label={"Login"}
                        className={"bg-btn-accent-light w-64 py-5 rounded-r-3xl justify-center"}
                        onClick={handleSubmit}/>
            </form>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                transition={Bounce}
            />
        </div>
    )
}
export default LoginForm
