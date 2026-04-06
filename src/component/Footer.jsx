import React from "react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="absolute bottom-0 w-full h-16 border-t border-gray-200 bg-white flex justify-around items-center">
      <button
        className="text-gray-500 hover:text-gray-700 flex items-center flex-col justify-center"
        onClick={() => {
          navigate("/");
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28px"
          height="28px"
          viewBox="0 0 28 28"
          fit=""
          preserveAspectRatio="xMidYMid meet"
          focusable="false"
        >
          <g
            fill="none"
            fill-rule="evenodd"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <g stroke="#95A1AD" stroke-width="2">
              <g>
                <path
                  d="M.823 13.214L12.615 1.41c.353-.35.83-.547 1.328-.545.498.001.974.2 1.325.554l11.804 11.795"
                  transform="translate(0 1)"
                ></path>
                <path
                  d="M23.323 9.466L23.323 24.464 4.572 24.464 4.572 9.46"
                  transform="translate(0 1)"
                ></path>
                <path
                  d="M17.698 24.464v-5.625c0-2.071-1.68-3.75-3.75-3.75-2.072 0-3.75 1.679-3.75 3.75v5.625"
                  transform="translate(0 1)"
                ></path>
              </g>
            </g>
          </g>
        </svg>
        <p className="text-xs pt-2">خانه</p>
      </button>
      <button className="text-gray-500 hover:text-gray-700 flex items-center flex-col justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28px"
          height="28px"
          viewBox="0 0 28 28"
          fit=""
          preserveAspectRatio="xMidYMid meet"
          focusable="false"
        >
          <g fill="none" fill-rule="evenodd">
            <g fill-rule="nonzero" stroke="#95A1AD" stroke-width="2">
              <g>
                <path
                  d="M24.29 10.577l-1.372-.487c-.397-.141-.716-.444-.877-.833-.161-.39-.15-.83.032-1.21h0l.624-1.314c.466-.983.264-2.154-.506-2.923-.77-.77-1.94-.972-2.923-.506l-1.314.625c-.38.18-.82.192-1.21.03-.388-.161-.69-.48-.832-.877l-.488-1.37C15.06.687 14.088.002 13 .002c-1.088 0-2.059.685-2.425 1.71l-.487 1.371c-.141.397-.444.715-.833.877-.39.161-.829.15-1.21-.03l-1.313-.626c-.983-.466-2.154-.264-2.923.506-.77.77-.972 1.94-.506 2.923l.624 1.314c.181.38.193.82.032 1.21-.162.389-.48.692-.877.833l-1.371.488C.685 10.943 0 11.913 0 13.002c0 1.088.684 2.059 1.71 2.424l1.371.487c.397.141.715.444.876.833.162.39.15.829-.03 1.21l-.625 1.313c-.466.984-.264 2.154.506 2.923.77.77 1.94.972 2.923.506l1.314-.624c.38-.181.82-.193 1.21-.031.389.16.691.48.832.877l.488 1.37C10.94 25.317 11.912 26 13 26c1.088 0 2.059-.684 2.425-1.71l.487-1.371c.141-.397.444-.715.833-.876.39-.161.829-.15 1.21.031l1.313.624c.983.466 2.154.264 2.923-.506.77-.77.972-1.94.506-2.923l-.624-1.314c-.181-.38-.193-.82-.031-1.209.16-.389.479-.692.876-.833l1.371-.489C25.315 15.06 26 14.09 26 13.002c0-1.089-.684-2.06-1.71-2.424zM13 18.184c-2.09-.03-3.97-1.277-4.811-3.19-1.097-2.656.163-5.7 2.817-6.804 2.656-1.062 5.676.187 6.804 2.817 1.097 2.656-.163 5.7-2.817 6.804-.631.26-1.31.387-1.993.373z"
                  transform="translate(1 1)"
                ></path>
              </g>
            </g>
          </g>
        </svg>
        <p className="text-xs pt-2">تنظیمات</p>
      </button>
      <button
        className="text-gray-500 hover:text-gray-700 flex items-center flex-col justify-center"
        onClick={() => {
          navigate("/profile");
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28px"
          height="28px"
          viewBox="0 0 28 28"
          fit=""
          preserveAspectRatio="xMidYMid meet"
          focusable="false"
        >
          <g
            fill="none"
            fill-rule="evenodd"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <g stroke="#95A1AD" stroke-width="2">
              <g transform="translate(1 1)">
                <circle cx="13" cy="10.563" r="5.688"></circle>
                <path d="M20.49 22.616C18.506 20.62 15.811 19.5 13 19.5c-2.812 0-5.507 1.121-7.49 3.116"></path>
                <circle cx="13" cy="13" r="12.188"></circle>
              </g>
            </g>
          </g>
        </svg>
        <p className="text-xs pt-2">پروفایل</p>
      </button>
    </footer>
  );
}
