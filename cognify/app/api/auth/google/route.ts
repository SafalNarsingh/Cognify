// import { supabase } from '../../../../lib/supabaseClient';
// import type { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// export const options: NextAuthOptions = {
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID as string,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//         }),
//     ],
//     callbacks: {
//         async signIn({ user }) {
//             try {
//                 const { data: existingUser, error } = await supabase
//                     .from("users")
//                     .select("*")
//                     .eq("email", user.email)
//                     .single(); // Ensure we get a single user object

//                 if (!existingUser) {
//                     const { data, error: insertError } = await supabase
//                         .from("users")
//                         .insert([
//                             {
//                                 email: user.email,
//                                 username: user.name,
//                                 image: user.image,
//                             },
//                         ])
//                         .select()
//                         .single(); // Get newly inserted user

//                     if (insertError) {
//                         console.error("Error inserting user:", insertError.message);
//                         return false;
//                     }
//                     return true;
//                 }
//                 return true;
//             } catch (error) {
//                 console.error("ERROR SIGNING IN:", error);
//                 return false;
//             }
//         },

//         async session({ session }) {
//             if (!session?.user?.email) return session;

//             // Fetch user ID from Supabase based on session user email
//             const { data: existingUser, error } = await supabase
//                 .from("users")
//                 .select("id")
//                 .eq("email", session.user.email)
//                 .single(); // Ensure we get a single user object

//             if (existingUser) {
//                 session.user.id = existingUser.id; // Attach the id to session.user
//             }

//             return session;
//         },
//     },
// };